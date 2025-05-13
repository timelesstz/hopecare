// This file is deprecated. Use FirebaseAuthContext.tsx instead.
// Keeping this file for backward compatibility, but redirecting to the main auth context.

/**
 * Auth Hook
 * This is a compatibility layer to ensure existing components
 * continue to work during the migration from Firebase to Supabase
 * 
 * This hook now uses the Supabase authentication system directly
 * but maintains the same interface as the previous Firebase auth
 */
import { useSupabaseAuth } from './useSupabaseAuth';

// Export the Supabase auth hook with the same name for backward compatibility
export const useAuth = useSupabaseAuth;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn(
    'AuthProvider from useAuth.tsx is deprecated. Use FirebaseAuthProvider from FirebaseAuthContext.tsx instead.'
  );
  
  // Just pass through to the children, assuming FirebaseAuthProvider is used at a higher level
  return <>{children}</>;
};
