import { FirebaseError } from 'firebase/app';

// Map Firestore error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  // Permission errors
  'permission-denied': 'You do not have permission to perform this operation.',
  
  // Document errors
  'not-found': 'The requested document was not found.',
  'already-exists': 'The document already exists and cannot be created again.',
  
  // Network errors
  'unavailable': 'The service is currently unavailable. Please check your internet connection and try again.',
  'deadline-exceeded': 'The operation timed out. Please try again.',
  
  // Invalid argument errors
  'invalid-argument': 'Invalid argument provided to the operation.',
  'out-of-range': 'The operation was attempted past the valid range.',
  
  // Resource errors
  'resource-exhausted': 'The operation was rejected because the system is out of resources.',
  'failed-precondition': 'The operation was rejected because the system is not in a state required for the operation.',
  
  // Internal errors
  'internal': 'An internal error occurred. Please try again later.',
  'aborted': 'The operation was aborted, typically due to a concurrency issue.',
  'cancelled': 'The operation was cancelled.',
  'data-loss': 'Unrecoverable data loss or corruption.',
  'unknown': 'An unknown error occurred.',
  'unimplemented': 'The operation is not implemented or not supported.',
  
  // Default error message
  'default': 'An error occurred while accessing the database. Please try again.'
};

/**
 * Handles Firestore errors and returns user-friendly error messages
 * @param error The error object from Firestore
 * @returns A user-friendly error message
 */
export const handleFirestoreError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    // Extract the error code from the full code (remove the 'firestore/' prefix)
    const errorCode = error.code.replace('firestore/', '');
    
    // Return the mapped error message or the default message if the code is not found
    return errorMessages[errorCode] || errorMessages['default'];
  }
  
  // For non-Firebase errors, return a generic message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Logs Firestore errors for debugging purposes
 * @param error The error object
 * @param context Additional context information
 */
export const logFirestoreError = (error: unknown, context: string = ''): void => {
  if (error instanceof FirebaseError) {
    console.error(`Firestore Error [${context}]:`, {
      code: error.code,
      message: error.message,
      customData: error.customData
    });
  } else if (error instanceof Error) {
    console.error(`Firestore Error [${context}]:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(`Firestore Error [${context}]:`, error);
  }
};

/**
 * Determines if the error is related to permissions
 * @param error The error object
 * @returns True if the error is permission-related
 */
export const isPermissionError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code.includes('permission-denied');
  }
  return false;
};

/**
 * Determines if the error is related to network connectivity
 * @param error The error object
 * @returns True if the error is network-related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return ['unavailable', 'deadline-exceeded'].some(code => 
      error.code.includes(code)
    );
  }
  return false;
};

/**
 * Determines if the error is related to document existence
 * @param error The error object
 * @returns True if the error is related to document existence
 */
export const isDocumentExistsError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return ['not-found', 'already-exists'].some(code => 
      error.code.includes(code)
    );
  }
  return false;
};

/**
 * Check if a Firestore error is due to a missing collection
 * @param error The error to check
 * @returns True if the error is due to a missing collection
 */
export const isMissingCollectionError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code === 'not-found' || 
           error.message.includes('collection not found') ||
           error.message.includes('Missing or insufficient permissions');
  }
  
  if (error instanceof Error) {
    return error.message.includes('collection not found') ||
           error.message.includes('Missing or insufficient permissions');
  }
  
  return false;
};

export default {
  handleFirestoreError,
  logFirestoreError,
  isPermissionError,
  isNetworkError,
  isDocumentExistsError,
  isMissingCollectionError
};