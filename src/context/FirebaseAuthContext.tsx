import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../lib/firebase';
import { handleAuthError, logAuthError } from '../utils/authErrorHandler';
import { toast } from 'react-hot-toast';

// Helper function to safely convert Firestore timestamps to ISO strings
const convertTimestampToISOString = (val: any): string | null => {
  if (!val) return null;
  
  // Handle string timestamps
  if (typeof val === 'string') return val;
  
  // Handle Firestore Timestamp objects
  if (val.seconds !== undefined && val.nanoseconds !== undefined) {
    return new Date(val.seconds * 1000 + val.nanoseconds / 1000000).toISOString();
  }
  
  // Handle Date objects
  if (val instanceof Date) {
    return val.toISOString();
  }
  
  // Handle objects with toDate method (Firestore Timestamp)
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch (error) {
      console.warn('Error converting timestamp with toDate():', error);
      return null;
    }
  }
  
  // Return null for unsupported formats
  console.warn('Unsupported timestamp format:', val);
  return null;
};

// Reuse the same user schema from the existing AuthContext
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['ADMIN', 'DONOR', 'VOLUNTEER']),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  last_login: z.any().transform(convertTimestampToISOString).nullable().optional(),
  created_at: z.any().transform(convertTimestampToISOString).nullable().optional(),
  updated_at: z.any().transform(convertTimestampToISOString).nullable().optional(),
  customClaims: z.record(z.any()).optional()
});

export type UserData = z.infer<typeof userSchema>;

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  lastActivity: number;
}

interface FirebaseAuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  lastActivity: number;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: Omit<UserData, 'id' | 'last_login' | 'created_at' | 'updated_at'>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  clearError: () => void;
  socialAuth: (provider: 'google' | 'microsoft', role: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  checkUserRole: (requiredRole: string) => boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'firebase_user_auth';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    lastActivity: Date.now()
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Get custom claims from token
            const tokenResult = await getIdTokenResult(firebaseUser);
            const customClaims = tokenResult.claims;
            
            // Use our helper function to convert timestamps
            const formattedUserData = {
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email,
              name: userData.name || firebaseUser.displayName || 'User',
              role: userData.role || 'DONOR',
              status: userData.status || 'ACTIVE',
              last_login: userData.last_login,
              created_at: userData.created_at,
              updated_at: userData.updated_at,
              customClaims
            };
            
            try {
              // Validate with Zod schema
              const validatedUser = userSchema.parse(formattedUserData);
              
              // Update last login time
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                last_login: serverTimestamp()
              });
              
              setState(prev => ({
                ...prev,
                isAuthenticated: true,
                user: validatedUser,
                loading: false,
                lastActivity: Date.now()
              }));
              
              // Save to localStorage
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                isAuthenticated: true,
                user: validatedUser,
                lastActivity: Date.now()
              }));
            } catch (validationError) {
              console.error('User validation error:', validationError);
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Invalid user data format'
              }));
            }
          } else {
            // User exists in Firebase Auth but not in Firestore
            // Create a new user document
            const newUserData = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'DONOR', // Default role
              status: 'ACTIVE',
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
              last_login: serverTimestamp()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            
            const formattedUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'DONOR',
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            };
            
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: formattedUserData,
              loading: false,
              lastActivity: Date.now()
            }));
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              isAuthenticated: true,
              user: formattedUserData,
              lastActivity: Date.now()
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch user data'
          }));
        }
      } else {
        // No user is signed in
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false
        }));
      }
    });
    
    // Set up activity tracking
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    
    // Check for inactivity periodically
    const inactivityInterval = setInterval(checkActivity, 60000); // Check every minute
    
    return () => {
      unsubscribe();
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(inactivityInterval);
    };
  }, []);
  
  const checkActivity = () => {
    const now = Date.now();
    if (state.isAuthenticated && now - state.lastActivity > INACTIVITY_TIMEOUT) {
      console.log('User inactive for too long, logging out');
      logout();
      toast.info('You have been logged out due to inactivity');
    }
  };
  
  const updateActivity = () => {
    setState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
    
    // Update localStorage
    if (state.isAuthenticated && state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isAuthenticated: true,
        user: state.user,
        lastActivity: Date.now()
      }));
    }
  };

  const login = async (email: string, password: string, role?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Validate email and password
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const newUserData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: role || 'DONOR',
          status: 'ACTIVE',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          last_login: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
      } else {
        // Check if user has the required role (if specified)
        const userData = userDoc.data();
        
        if (role && userData.role !== role) {
          // If role is specified and user doesn't have that role, throw error
          await signOut(auth);
          throw new Error(`You don't have ${role} privileges`);
        }
        
        // Check if user is active
        if (userData.status === 'INACTIVE') {
          await signOut(auth);
          throw new Error('Your account has been deactivated. Please contact support.');
        }
        
        // Update last login time
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          last_login: serverTimestamp()
        });
      }
      
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'login');
      
      throw error;
    }
  };

  const register = async (data: Omit<UserData, 'id' | 'last_login' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Validate data
      if (!data.email || !data.name) {
        throw new Error('Email and name are required');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password || Math.random().toString(36).slice(2) // Generate random password if not provided
      );
      
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateFirebaseProfile(firebaseUser, {
        displayName: data.name
      });
      
      // Create user document in Firestore
      const userData = {
        email: data.email,
        name: data.name,
        role: data.role || 'DONOR',
        status: data.status || 'ACTIVE',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        last_login: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Auth state listener will handle the rest
      toast.success('Registration successful! Please verify your email.');
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'register');
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem(STORAGE_KEY);
      
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        lastActivity: Date.now()
      });
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Validate email
      if (!email) {
        throw new Error('Email is required');
      }
      
      await sendPasswordResetEmail(auth, email);
      
      setState(prev => ({ ...prev, loading: false }));
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'resetPassword');
      
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    try {
      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const userRef = doc(db, 'users', state.user.id);
      
      // Update Firestore document
      await updateDoc(userRef, {
        ...data,
        updated_at: serverTimestamp()
      });
      
      // Update display name in Firebase Auth if name is provided
      if (data.name && auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.name
        });
      }
      
      // Get updated user data
      const updatedUserDoc = await getDoc(userRef);
      
      if (updatedUserDoc.exists()) {
        const updatedUserData = updatedUserDoc.data();
        
        // Convert Firestore timestamps to ISO strings
        const formattedUserData = {
          ...state.user,
          ...data,
          updated_at: new Date().toISOString()
        };
        
        setState(prev => ({
          ...prev,
          user: formattedUserData,
          loading: false,
          lastActivity: Date.now()
        }));
        
        // Update localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isAuthenticated: true,
          user: formattedUserData,
          lastActivity: Date.now()
        }));
        
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'updateProfile');
      
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const socialAuth = async (provider: 'google' | 'microsoft', role: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      let authProvider;
      
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
      } else {
        throw new Error('Unsupported provider');
      }
      
      const result = await signInWithPopup(auth, authProvider);
      const firebaseUser = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const userData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: role || 'DONOR',
          status: 'ACTIVE',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          last_login: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          last_login: serverTimestamp()
        });
      }
      
      // Auth state listener will handle the rest
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Social auth error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      logAuthError(error, 'socialAuth');
      
      throw error;
    }
  };
  
  const verifyEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('Verify email error:', error);
      
      const errorMessage = handleAuthError(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      logAuthError(error, 'verifyEmail');
      
      throw error;
    }
  };
  
  const checkUserRole = (requiredRole: string): boolean => {
    if (!state.user) return false;
    
    // Direct role match
    if (state.user.role === requiredRole) {
      return true;
    }
    
    // Check custom claims
    if (state.user.customClaims) {
      // Check role in custom claims
      if (state.user.customClaims.role === requiredRole) {
        return true;
      }
      
      // Special case for admin
      if (requiredRole === 'ADMIN' && 
          (state.user.customClaims.isAdmin === true || 
           state.user.customClaims.admin === true)) {
        return true;
      }
    }
    
    // Special case for admin email
    if (requiredRole === 'ADMIN' && 
        (state.user.email === 'admin@hopecaretz.org' || 
         state.user.email === 'admin@hopecare.org')) {
      return true;
    }
    
    return false;
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <FirebaseAuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        lastActivity: state.lastActivity,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        clearError,
        socialAuth,
        verifyEmail,
        checkUserRole
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  
  return context;
} 