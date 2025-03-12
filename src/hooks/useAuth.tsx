// This file is deprecated. Use FirebaseAuthContext.tsx instead.
// Keeping this file for backward compatibility, but redirecting to the main auth context.

import { useFirebaseAuth } from '../context/FirebaseAuthContext';

export const useAuth = useFirebaseAuth;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn(
    'AuthProvider from useAuth.tsx is deprecated. Use FirebaseAuthProvider from FirebaseAuthContext.tsx instead.'
  );
  
  // Just pass through to the children, assuming FirebaseAuthProvider is used at a higher level
  return <>{children}</>;
};
