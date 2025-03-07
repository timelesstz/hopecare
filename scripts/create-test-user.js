// This script creates a test user in Supabase for development purposes
// Run with: node scripts/create-test-user.js

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('Creating test donor user...');
    
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'john.doe@example.com',
      password: 'Donor2024!',
      email_confirm: true, // Skip email verification
      user_metadata: {
        name: 'John Doe',
        role: 'DONOR',
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // 2. Create the user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'DONOR',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return;
    }

    // 3. Create donor profile
    const { error: donorProfileError } = await supabase
      .from('donor_profiles')
      .insert([{
        id: authData.user.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        status: 'active',
        preferences: {
          interests: ['education', 'health'],
          preferredCommunication: 'email'
        }
      }]);

    if (donorProfileError) {
      console.error('Error creating donor profile:', donorProfileError);
      return;
    }

    console.log('Test donor user created successfully!');
    console.log('Email: john.doe@example.com');
    console.log('Password: Donor2024!');
    console.log('Role: DONOR');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser(); 