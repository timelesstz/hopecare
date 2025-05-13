// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Environment variables should be properly set up in .env files
// Using project ID from migration memory as fallback
const PROJECT_ID = 'tkxppievtqiipcsdqbpf';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Check if environment variables are properly set
if (!supabaseAnonKey) {
  console.error(
    'Missing Supabase API key. ' +
    'Please check your environment variables.'
  );
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Initialize Supabase client with proper error handling
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey || ''
);

// Export for use throughout the application
export default supabase;
