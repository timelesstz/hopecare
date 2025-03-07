import { FirebaseError } from 'firebase/app';
import { toast } from 'react-hot-toast';
import { isPermissionError, logFirestoreError, isMissingIndexError, extractIndexUrl } from './firestoreErrorHandler';

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param retries Maximum number of retries
 * @param delay Initial delay in milliseconds
 * @param backoffFactor Factor to increase delay by each retry
 * @returns Result of the function or throws an error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 300,
  backoffFactor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Don't retry if we're out of retries
    if (retries <= 0) {
      throw error;
    }
    
    // Don't retry for permission errors or missing index errors
    if (isPermissionError(error) || isMissingIndexError(error)) {
      throw error;
    }
    
    // Log the error for debugging
    if (error instanceof FirebaseError) {
      console.warn(`Retrying Firestore operation after error: ${error.code}`, error);
    } else {
      console.warn('Retrying Firestore operation after non-Firebase error', error);
    }
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with increased delay
    return retryWithBackoff(fn, retries - 1, delay * backoffFactor, backoffFactor);
  }
}

/**
 * Safely execute a Firestore operation with error handling and retries
 * @param operation The Firestore operation to execute
 * @param errorMessage User-friendly error message to display
 * @param context Additional context for error logging
 * @param retries Number of retries
 * @returns Result of the operation or null if it failed
 */
export async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context: string = '',
  retries = 3
): Promise<T | null> {
  try {
    return await retryWithBackoff(operation, retries);
  } catch (error) {
    logFirestoreError(error, context);
    
    if (error instanceof FirebaseError) {
      // Handle specific Firebase errors
      switch (error.code) {
        case 'permission-denied':
          toast.error('You do not have permission to perform this action');
          break;
        case 'not-found':
          toast.error('The requested data could not be found');
          break;
        case 'unavailable':
          toast.error('The service is currently unavailable. Please try again later');
          break;
        case 'failed-precondition':
          // Check if it's a missing index error
          if (isMissingIndexError(error)) {
            const indexUrl = extractIndexUrl(error);
            if (indexUrl) {
              toast.error(
                <div>
                  Missing Firestore index. 
                  <a 
                    href={indexUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 underline text-blue-600"
                  >
                    Create it here
                  </a>
                </div>,
                { duration: 10000 }
              );
            } else {
              toast.error('This query requires a Firestore index. Please check the console for details.');
            }
          } else {
            toast.error(errorMessage);
          }
          break;
        default:
          toast.error(errorMessage);
      }
    } else {
      toast.error(errorMessage);
    }
    
    return null;
  }
}

/**
 * Check if a Firestore error is due to a missing collection
 * @param error The error to check
 * @returns True if the error is due to a missing collection
 */
export function isMissingCollectionError(error: unknown): boolean {
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
} 