import { FirebaseError } from 'firebase/app';

/**
 * Get a user-friendly error message for Firebase errors
 * @param error The Firebase error
 * @returns A user-friendly error message
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'This email is already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again';
      
      // Firestore errors
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'not-found':
        return 'The requested data could not be found';
      case 'already-exists':
        return 'The document already exists';
      case 'failed-precondition':
        return 'Operation failed due to a precondition failure';
      case 'aborted':
        return 'The operation was aborted';
      case 'out-of-range':
        return 'Operation was attempted past the valid range';
      case 'unimplemented':
        return 'Operation is not implemented or not supported';
      case 'internal':
        return 'Internal server error';
      case 'unavailable':
        return 'The service is currently unavailable. Please try again later';
      case 'data-loss':
        return 'Unrecoverable data loss or corruption';
      case 'unauthenticated':
        return 'The request does not have valid authentication credentials';
      
      // Default case
      default:
        return `An error occurred: ${error.message}`;
    }
  }
  
  // Handle non-Firebase errors
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  
  // Handle unknown errors
  return 'An unknown error occurred';
}

/**
 * Log a Firebase error with additional context
 * @param error The error to log
 * @param context Additional context about where the error occurred
 */
export function logFirebaseError(error: unknown, context: string): void {
  if (error instanceof FirebaseError) {
    console.error(`Firebase error in ${context}:`, {
      code: error.code,
      message: error.message,
      details: error.customData
    });
  } else if (error instanceof Error) {
    console.error(`Error in ${context}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(`Unknown error in ${context}:`, error);
  }
}

/**
 * Handle a Firebase error by logging it and returning a user-friendly message
 * @param error The error to handle
 * @param context Additional context about where the error occurred
 * @returns A user-friendly error message
 */
export function handleFirebaseError(error: unknown, context: string): string {
  logFirebaseError(error, context);
  return getFirebaseErrorMessage(error);
} 