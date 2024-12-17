import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;

  private constructor() {}

  public static getInstance() {
    if (!SupabaseClient.instance) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      SupabaseClient.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return SupabaseClient.instance;
  }
}

export const supabase = SupabaseClient.getInstance();
