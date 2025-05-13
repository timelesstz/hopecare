// Script to create admin user in Supabase using direct API calls
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: new URL('../../../.env', import.meta.url).pathname });

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://tkxppievtqiipcsdqbpf.supabase.co`;
// Use the key that's available in your .env file
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// Log all environment variables to debug
console.log('Environment variables:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('- VITE_SUPABASE_KEY:', process.env.VITE_SUPABASE_KEY ? 'Available (hidden)' : 'Not available');
console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Available (hidden)' : 'Not available');

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_KEY environment variable');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('API key available:', !!supabaseKey);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user in Supabase...');
    
    // Admin user credentials
    const adminEmail = 'admin@hopecaretz.org';
    const adminPassword = 'Hope@admin2';
    const adminName = 'HopeCare Admin';
    
    // Step 1: Sign up the admin user
    const { data, error: signupError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName,
          role: 'admin'
        }
      }
    });
    
    if (signupError) {
      // If the error is about the user already existing, we can proceed
      if (!signupError.message.includes('already registered')) {
        console.error('Error signing up admin user:', signupError.message);
        process.exit(1);
      }
      console.log('Admin user already exists, attempting to sign in...');
    } else {
      console.log('Admin user signup successful');
    }
    
    // Step 2: Sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signInError) {
      console.error('Error signing in as admin:', signInError.message);
      process.exit(1);
    }
    
    const userId = signInData.user.id;
    console.log('Admin user authenticated with ID:', userId);
    
    // Step 3: Check if user exists in public.users
    const { data: existingPublicUser, error: checkPublicError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkPublicError && !checkPublicError.message.includes('No rows found')) {
      console.error('Error checking for user in public.users:', checkPublicError.message);
    }
    
    // Step 4: Create or update the user record in public.users
    if (!existingPublicUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: adminEmail,
          display_name: adminName,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating user record in public.users:', insertError.message);
        process.exit(1);
      }
      
      console.log('User record created in public.users');
    } else {
      console.log('User already exists in public.users, skipping creation');
    }
    
    // Step 5: Check if admin profile exists
    const { data: existingAdminProfile, error: checkAdminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkAdminError && !checkAdminError.message.includes('No rows found')) {
      console.error('Error checking for admin profile:', checkAdminError.message);
    }
    
    // Step 6: Create or update the admin profile
    if (!existingAdminProfile) {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          id: userId,
          full_name: adminName,
          position: 'Administrator',
          department: 'Management',
          access_level: 'full',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Error creating admin profile:', profileError.message);
        process.exit(1);
      }
      
      console.log('Admin profile created in admin_profiles');
    } else {
      console.log('Admin profile already exists, skipping creation');
    }
    
    console.log('Admin user migration completed successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('Unexpected error during admin user creation:', error.message);
    process.exit(1);
  }
}

// Execute the function
createAdminUser();
