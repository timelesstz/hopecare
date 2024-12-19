import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const getUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, role: UserRole = 'volunteer') => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: role,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(userRef, userData, { merge: true });
    return userData;
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let profile = await getUserProfile(firebaseUser);
          if (!profile) {
            profile = await createUserProfile(firebaseUser);
          } else {
            // Update last login
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: new Date()
            });
          }
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const profile = await getUserProfile(result.user);
      if (!profile) {
        await createUserProfile(result.user);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Email sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with email');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, role);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { ...data, updatedAt: new Date() });
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
