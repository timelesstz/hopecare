/**
 * Supabase Auth Hook
 * 
 * This hook provides a unified interface for authentication that matches
 * the previous Firebase auth structure but uses Supabase under the hood.
 */

import { useAuth } from '../contexts/AuthContext';

// Define the interface for the auth hook to match Firebase's structure
export interface SupabaseAuthUser {
  uid?: string;
  email?: string;
  role?: string;
  displayName?: string;
}

export interface SupabaseAuthHook {
  user: SupabaseAuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

/**
 * Hook that provides authentication functionality with a Firebase-compatible interface
 * but uses Supabase under the hood
 */
export const useSupabaseAuth = (): SupabaseAuthHook => {
  const { 
    user, 
    userDetails, 
    loading, 
    error, 
    isAuthenticated,
    logout,
    resetPassword
  } = useAuth();

  // Map Supabase user to Firebase-compatible format
  const mappedUser = user && userDetails ? {
    uid: user.id,
    email: user.email,
    role: userDetails.role?.toUpperCase() || 'USER',
    displayName: userDetails.display_name || user.email?.split('@')[0] || ''
  } : null;

  // Check if user is admin
  const isAdmin = mappedUser?.role === 'ADMIN';

  return {
    user: mappedUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    logout,
    resetPassword
  };
};

export default useSupabaseAuth;
