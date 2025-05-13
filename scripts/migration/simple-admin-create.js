// Simple script to create admin user in Supabase
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase URL and key for simplicity
const supabaseUrl = 'https://tkxppievtqiipcsdqbpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreHBwaWV2dHFpaXBjc2RxYnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MDUwMjksImV4cCI6MjA1NzA4MTAyOX0.A0uXde7XAAPYwneYdt4301WjSHct3mZcnAi1Ec5h5Q0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin user credentials
const adminEmail = 'admin@hopecaretz.org';
const adminPassword = 'Hope@admin2';
const adminName = 'HopeCare Admin';

async function createAdminUser() {
  try {
    console.log('Creating admin user in Supabase...');
    
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
        return;
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
      return;
    }
    
    const userId = signInData.user.id;
    console.log('Admin user authenticated with ID:', userId);
    
    // Step 3: Check if user exists in public.users
    const { data: existingPublicUser, error: checkPublicError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkPublicError && !checkPublicError.message.includes('does not exist')) {
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
      } else {
        console.log('User record created in public.users');
      }
    } else {
      console.log('User already exists in public.users, skipping creation');
    }
    
    // Step 5: Check if admin profile exists
    const { data: existingAdminProfile, error: checkAdminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkAdminError && !checkAdminError.message.includes('does not exist')) {
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
      } else {
        console.log('Admin profile created in admin_profiles');
      }
    } else {
      console.log('Admin profile already exists, skipping creation');
    }
    
    console.log('Admin user migration completed successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('Unexpected error during admin user creation:', error.message);
  }
}

// Execute the function
createAdminUser();
