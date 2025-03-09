import { createClient } from '@supabase/supabase-js';
import { env } from '../utils/envUtils';
import { handleError, ErrorType } from '../utils/errorUtils';

// Initialize Supabase client with error handling
let supabase;

try {
  // Get Supabase credentials from environment variables
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  // Create Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('Supabase client initialized successfully');
} catch (error) {
  handleError(error, ErrorType.UNKNOWN, {
    context: 'supabase-init',
    userMessage: 'Failed to initialize Supabase client',
    showToast: false
  });
  
  // Create a dummy client that returns errors
  supabase = {
    from: () => ({
      select: () => Promise.reject(new Error('Supabase not initialized')),
      insert: () => Promise.reject(new Error('Supabase not initialized')),
      update: () => Promise.reject(new Error('Supabase not initialized')),
      delete: () => Promise.reject(new Error('Supabase not initialized'))
    }),
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not initialized')),
        getPublicUrl: () => ({ data: null, error: new Error('Supabase not initialized') }),
        download: () => Promise.reject(new Error('Supabase not initialized')),
        remove: () => Promise.reject(new Error('Supabase not initialized')),
        list: () => Promise.reject(new Error('Supabase not initialized'))
      })
    },
    auth: {
      signIn: () => Promise.reject(new Error('Supabase not initialized')),
      signUp: () => Promise.reject(new Error('Supabase not initialized')),
      signOut: () => Promise.reject(new Error('Supabase not initialized')),
      onAuthStateChange: () => ({ data: null, error: new Error('Supabase not initialized') })
    }
  };
}

export { supabase }; 