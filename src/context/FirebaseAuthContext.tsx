import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../lib/firebase';

// Reuse the same user schema from the existing AuthContext
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['ADMIN', 'DONOR', 'VOLUNTEER']),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  last_login: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userSchema.parse({
              id: firebaseUser.uid,
              ...userDoc.data()
            });
            
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: userData,
              loading: false,
              error: null,
              lastActivity: Date.now()
            }));
          } else {
            // User exists in Firebase Auth but not in Firestore
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'User profile not found'
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
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkActivity = () => {
      if (state.isAuthenticated && Date.now() - state.lastActivity > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.lastActivity]);

  useEffect(() => {
    const updateActivity = () => {
      if (state.isAuthenticated) {
        setState(prev => ({ ...prev, lastActivity: Date.now() }));
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [state.isAuthenticated]);

  const login = async (email: string, password: string, role?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log(`Login attempt for ${email} with role ${role || 'not specified'}`);
      
      // Temporary local admin authentication for development
      if (email === 'admin@hopecare.org' && password === 'admin@2025' && role === 'ADMIN') {
        console.log('Using temporary admin authentication');
        const tempAdminUser: UserData = {
          id: 'temp-admin-id',
          email: 'admin@hopecare.org',
          name: 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: tempAdminUser,
          loading: false,
          error: null,
          lastActivity: Date.now()
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: tempAdminUser,
          lastActivity: Date.now()
        }));

        return;
      }

      // For testing purposes - allow sample donor login
      if (email === 'john.doe@example.com' && password === 'Donor2024!' && (role === 'DONOR' || !role)) {
        console.log('Using sample donor authentication');
        const tempDonorUser: UserData = {
          id: 'temp-donor-id',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'DONOR',
          status: 'ACTIVE',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: tempDonorUser,
          loading: false,
          error: null,
          lastActivity: Date.now()
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: tempDonorUser,
          lastActivity: Date.now()
        }));

        return;
      }

      console.log('Attempting Firebase authentication');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        console.error('No user returned from authentication');
        throw new Error('No user returned from authentication');
      }

      console.log('User authenticated, fetching profile');
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.error('User profile not found');
        throw new Error('User profile not found');
      }
      
      const profile = userDoc.data();

      // Verify role if specified
      if (role && profile.role !== role) {
        console.error(`Invalid role: expected ${role}, got ${profile.role}`);
        throw new Error(`Invalid credentials for ${role.toLowerCase()} login`);
      }

      console.log('Login successful, updating state');
      const userData = userSchema.parse({
        id: firebaseUser.uid,
        ...profile
      });
      
      // Update last login time
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        last_login: new Date().toISOString(),
      });
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null,
        lastActivity: Date.now()
      }));

      // Store session data
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: userData,
        lastActivity: Date.now()
      }));

    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during login'
      }));
      throw error;
    }
  };

  const register = async (data: Omit<UserData, 'id' | 'last_login' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create auth user with email verification
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.name
      });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: data.email,
        name: data.name,
        role: data.role,
        status: 'INACTIVE', // Will be activated after email verification
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Log registration attempt
      await setDoc(doc(db, 'audit_logs', `${firebaseUser.uid}_${Date.now()}`), {
        user_id: firebaseUser.uid,
        action: 'REGISTER',
        details: {
          email: data.email,
          role: data.role,
          timestamp: new Date().toISOString()
        },
        created_at: serverTimestamp()
      });

      setState(prev => ({
        ...prev,
        error: null,
        loading: false
      }));
      
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
        loading: false
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await signOut(auth);
      
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        lastActivity: Date.now()
      });
      
      localStorage.removeItem(STORAGE_KEY);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Logout failed'
      }));
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await sendPasswordResetEmail(auth, email);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Password reset failed'
      }));
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (!state.user?.id) throw new Error('No user logged in');

      await updateDoc(doc(db, 'users', state.user.id), {
        ...data,
        updated_at: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Profile update failed'
      }));
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
        throw new Error('Provider not supported');
      }
      
      const result = await signInWithPopup(auth, authProvider);
      const firebaseUser = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: role,
          status: 'ACTIVE',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Update existing user
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      setState(prev => ({
        ...prev,
        error: null,
        loading: false
      }));
      
    } catch (error) {
      console.error('Social auth error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Social authentication failed',
        loading: false
      }));
      throw error;
    }
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
        ...state,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        clearError,
        socialAuth
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