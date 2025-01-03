import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey);
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to fetch system health
    const { data, error } = await supabase.from('_health').select('*');
    
    if (error) {
      console.error('Connection failed:', error.message);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Health check data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();
