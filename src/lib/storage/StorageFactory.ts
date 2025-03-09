import { StorageInterface } from './StorageInterface';
import { FirebaseStorageAdapter } from './FirebaseStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';

// Feature flag to determine which storage provider to use
// Set to true to use Supabase Storage, false to use Firebase Storage
const USE_SUPABASE_STORAGE = 
  import.meta.env.VITE_USE_SUPABASE_STORAGE === 'true' || 
  true; // Default to Supabase Storage

/**
 * Get the appropriate storage provider based on the feature flag
 * @returns The storage provider instance
 */
export function getStorageProvider(): StorageInterface {
  if (USE_SUPABASE_STORAGE) {
    console.log('Using Supabase Storage provider');
    return new SupabaseStorageAdapter();
  } else {
    console.log('Using Firebase Storage provider');
    return new FirebaseStorageAdapter();
  }
}

// Export a singleton instance of the storage provider
export const storageProvider = getStorageProvider(); 