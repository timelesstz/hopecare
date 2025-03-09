import { StorageInterface } from './StorageInterface';
import { FirebaseStorageAdapter } from './FirebaseStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
import { env } from '../../utils/envUtils';
import { handleError, ErrorType } from '../../utils/errorUtils';

/**
 * Get the appropriate storage provider based on the environment configuration
 * @returns The storage provider instance
 */
export function getStorageProvider(): StorageInterface {
  try {
    // Use the environment utility to get the storage provider flag
    const useSupabaseStorage = env.USE_SUPABASE_STORAGE;
    
    if (useSupabaseStorage) {
      console.log('Using Supabase Storage provider');
      return new SupabaseStorageAdapter();
    } else {
      console.log('Using Firebase Storage provider');
      return new FirebaseStorageAdapter();
    }
  } catch (error) {
    // Handle any errors that occur during initialization
    handleError(error, ErrorType.UNKNOWN, {
      context: 'storage-provider-init',
      userMessage: 'Failed to initialize storage provider',
      showToast: false
    });
    
    // Default to Firebase Storage in case of error
    console.log('Error initializing storage provider, defaulting to Firebase Storage');
    return new FirebaseStorageAdapter();
  }
}

// Export a singleton instance of the storage provider
export const storageProvider = getStorageProvider(); 