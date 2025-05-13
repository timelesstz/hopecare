/**
 * Firebase Auth Context Compatibility Layer
 * 
 * This file provides a compatibility layer for components that were previously using
 * Firebase authentication but now need to work with Supabase authentication.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppUser } from '../contexts/AuthContext';

// Define the interface for the Firebase Auth Context
interface FirebaseAuthContextType {
  user: {
    uid?: string;
    email?: string;
    role?: string;
    displayName?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  error: null
});

// Custom hook to use the Firebase Auth Context
export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

// Provider component for the Firebase Auth Context
export const FirebaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the Supabase Auth Context
  const { user, userDetails, loading, error } = useAuth();

  // Map Supabase user to Firebase user format
  const mappedUser = user && userDetails ? {
    uid: user.id,
    email: user.email,
    role: userDetails.role?.toUpperCase() || 'USER',
    displayName: userDetails.display_name || user.email?.split('@')[0] || ''
  } : null;

  return (
    <FirebaseAuthContext.Provider
      value={{
        user: mappedUser,
        loading,
        error
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
