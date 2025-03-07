import { FirebaseError } from 'firebase/app';

// Map Firebase auth error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  // Email/password authentication errors
  'auth/email-already-in-use': 'This email is already registered. Please use a different email or try logging in.',
  'auth/invalid-email': 'The email address is not valid. Please check and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
  'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later or reset your password.',
  'auth/weak-password': 'Password is too weak. Please use a stronger password with at least 6 characters.',
  
  // Account linking errors
  'auth/credential-already-in-use': 'This account is already linked to another user. Please use a different method.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/provider-already-linked': 'This account is already linked to this provider.',
  
  // Social authentication errors
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials. Sign in using a provider associated with this email address.',
  'auth/invalid-credential': 'The authentication credential is invalid. Please try again.',
  'auth/operation-not-supported-in-this-environment': 'This operation is not supported in your current environment.',
  'auth/timeout': 'The operation has timed out. Please try again.',
  'auth/popup-blocked': 'The authentication popup was blocked by your browser. Please allow popups for this site and try again.',
  'auth/popup-closed-by-user': 'The authentication popup was closed before the operation completed. Please try again.',
  
  // General errors
  'auth/network-request-failed': 'A network error occurred. Please check your internet connection and try again.',
  'auth/internal-error': 'An internal authentication error occurred. Please try again later.',
  'auth/invalid-api-key': 'The authentication API key is invalid. Please contact support.',
  'auth/app-deleted': 'The authentication instance has been deleted. Please refresh the page and try again.',
  'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  'auth/web-storage-unsupported': 'Web storage is not supported or is disabled in this browser. Please enable it or use a different browser.',
  
  // Default error message
  'default': 'An error occurred during authentication. Please try again.'
};

/**
 * Utility functions for handling authentication errors
 */

interface FirebaseAuthError {
  code?: string;
  message: string;
}

/**
 * Handles Firebase authentication errors and returns user-friendly error messages
 */
export const handleAuthError = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  const authError = error as FirebaseAuthError;
  const errorCode = authError.code || '';
  const errorMessage = authError.message || 'An unknown error occurred';
  
  // Common Firebase Auth error codes
  switch (errorCode) {
    // Email/password authentication errors
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials';
    case 'auth/invalid-credential':
      return 'Invalid credentials';
    case 'auth/invalid-verification-code':
      return 'Invalid verification code';
    case 'auth/invalid-verification-id':
      return 'Invalid verification ID';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing the sign-in';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations';
    case 'auth/timeout':
      return 'The operation has timed out';
      
    // Custom error codes
    case 'auth/role-not-found':
      return 'User role not found';
    case 'auth/invalid-role':
      return 'Invalid user role';
    case 'auth/user-not-admin':
      return 'You do not have admin privileges';
    case 'auth/user-not-verified':
      return 'Please verify your email address before proceeding';
    case 'auth/user-inactive':
      return 'Your account is inactive. Please contact support';
      
    default:
      // If no specific error code is matched, return the error message
      // But clean it up first to make it more user-friendly
      if (errorMessage.includes('Firebase:')) {
        return errorMessage.split('Firebase:')[1].trim();
      }
      return errorMessage;
  }
};

/**
 * Logs authentication errors for debugging purposes
 */
export const logAuthError = (error: unknown, operation: string): void => {
  if (!error) return;
  
  const authError = error as FirebaseAuthError;
  const errorCode = authError.code || 'unknown';
  const errorMessage = authError.message || 'Unknown error';
  
  console.error(`Auth error during ${operation}:`, {
    code: errorCode,
    message: errorMessage,
    timestamp: new Date().toISOString()
  });
  
  // Here you could also send the error to a logging service
  // like Firebase Analytics, Sentry, etc.
};

/**
 * Determines if the error is related to network connectivity
 * @param error The error object
 * @returns True if the error is network-related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code === 'auth/network-request-failed';
  }
  return false;
};

/**
 * Determines if the error is related to invalid credentials
 * @param error The error object
 * @returns True if the error is related to invalid credentials
 */
export const isCredentialError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return [
      'auth/wrong-password',
      'auth/user-not-found',
      'auth/invalid-email',
      'auth/invalid-credential'
    ].includes(error.code);
  }
  return false;
};

/**
 * Determines if the error is related to account existence
 * @param error The error object
 * @returns True if the error is related to account existence
 */
export const isAccountExistsError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return [
      'auth/email-already-in-use',
      'auth/account-exists-with-different-credential'
    ].includes(error.code);
  }
  return false;
};

export default {
  handleAuthError,
  logAuthError,
  isNetworkError,
  isCredentialError,
  isAccountExistsError
}; 