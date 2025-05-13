// Supabase Authentication Test Suite
// This script validates the authentication functionality after the Supabase migration.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Test credentials
const adminEmail = 'admin@hopecaretz.org';
const adminPassword = 'Hope@admin2';
const testEmail = 'test@hopecaretz.org';
const testPassword = 'testuser123';

// Initialize results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to run a test
async function runTest(name, testFn) {
  results.total++;
  console.log(chalk.blue(`\n[TEST] ${name}`));
  
  try {
    await testFn();
    console.log(chalk.green(`[PASS] ${name}`));
    results.passed++;
  } catch (error) {
    console.error(chalk.red(`[FAIL] ${name}`));
    console.error(chalk.red(`       ${error.message}`));
    results.failed++;
  }
}

// Main test function
async function runAuthTests() {
  console.log(chalk.yellow.bold('\n=== SUPABASE AUTHENTICATION TESTS ===\n'));
  
  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(chalk.red('Error: Supabase URL and anon key are required.'));
    console.error(chalk.red('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'));
    process.exit(1);
  }
  
  // Test 1: Admin Sign In
  await runTest('Admin Sign In', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) throw new Error(`Admin sign in failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned after sign in');
    
    console.log(chalk.gray(`  User ID: ${data.user.id}`));
    console.log(chalk.gray(`  Email: ${data.user.email}`));
  });
  
  // Test 2: Get User
  await runTest('Get User', async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw new Error(`Get user failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned from getUser');
    
    console.log(chalk.gray(`  User ID: ${data.user.id}`));
    console.log(chalk.gray(`  Email: ${data.user.email}`));
  });
  
  // Test 3: Get Session
  await runTest('Get Session', async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw new Error(`Get session failed: ${error.message}`);
    if (!data.session) throw new Error('No session returned');
    
    console.log(chalk.gray(`  Session expires at: ${new Date(data.session.expires_at * 1000).toLocaleString()}`));
  });
  
  // Test 4: Update User
  await runTest('Update User', async () => {
    const timestamp = new Date().toISOString();
    const { data, error } = await supabase.auth.updateUser({
      data: { last_test_run: timestamp }
    });
    
    if (error) throw new Error(`Update user failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned after update');
    
    console.log(chalk.gray(`  Updated metadata: last_test_run = ${timestamp}`));
  });
  
  // Test 5: Sign Out
  await runTest('Sign Out', async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw new Error(`Sign out failed: ${error.message}`);
    
    // Verify we're signed out
    const { data } = await supabase.auth.getUser();
    if (data.user) throw new Error('User still signed in after sign out');
  });
  
  // Test 6: Sign Up (only if test user doesn't exist)
  await runTest('Sign Up Test User (if needed)', async () => {
    // First try to sign in to see if user exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    // If user doesn't exist, create it
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log(chalk.gray('  Test user does not exist, creating...'));
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            display_name: 'Test User',
            role: 'USER'
          }
        }
      });
      
      if (error) throw new Error(`Sign up failed: ${error.message}`);
      if (!data.user) throw new Error('No user returned after sign up');
      
      console.log(chalk.gray(`  Created user ID: ${data.user.id}`));
    } else if (signInError) {
      throw new Error(`Unexpected error: ${signInError.message}`);
    } else {
      console.log(chalk.gray('  Test user already exists'));
    }
  });
  
  // Test 7: Password Reset Flow
  await runTest('Password Reset Flow', async () => {
    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:5173/reset-password'
    });
    
    if (error) throw new Error(`Password reset request failed: ${error.message}`);
    
    console.log(chalk.gray('  Password reset email would be sent in production'));
  });
  
  // Test 8: Admin Sign In Again
  await runTest('Admin Sign In Again', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) throw new Error(`Admin sign in failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned after sign in');
  });
  
  // Test 9: Verify Admin Role in Database
  await runTest('Verify Admin Role in Database', async () => {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not signed in');
    
    // Query the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    if (error) throw new Error(`Database query failed: ${error.message}`);
    if (!data) throw new Error('No user found in database');
    if (data.role !== 'ADMIN') throw new Error(`Expected role ADMIN but got ${data.role}`);
    
    console.log(chalk.gray(`  User ID: ${data.id}`));
    console.log(chalk.gray(`  Role: ${data.role}`));
    console.log(chalk.gray(`  Display Name: ${data.display_name || 'Not set'}`));
  });
  
  // Print summary
  console.log(chalk.yellow.bold('\n=== TEST SUMMARY ==='));
  console.log(chalk.blue(`Total tests: ${results.total}`));
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));
  
  if (results.failed > 0) {
    console.log(chalk.red.bold('\n❌ Some tests failed!'));
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\n✅ All authentication tests passed!'));
  }
}

// Run the tests
runAuthTests().catch(error => {
  console.error(chalk.red(`\nUnhandled error: ${error.message}`));
  process.exit(1);
});
