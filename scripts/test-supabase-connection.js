// Test Supabase Connection and Basic Functionality
// This script validates that the Supabase migration is working correctly
// by testing the connection and basic CRUD operations.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL and anon key are required.');
  console.error('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test admin credentials
const adminEmail = 'admin@hopecaretz.org';
const adminPassword = 'Hope@admin2';

// Helper function to run tests
async function runTests() {
  console.log('🔍 Starting Supabase Migration Validation Tests');
  console.log('==============================================');
  
  try {
    // Test 1: Authentication
    console.log('\n📋 Test 1: Authentication');
    console.log('------------------------');
    
    console.log('Signing in with admin credentials...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    console.log('✅ Authentication successful!');
    console.log(`User ID: ${authData.user.id}`);
    console.log(`Email: ${authData.user.email}`);
    console.log(`Role: ${authData.user.role || 'Not specified in auth response'}`);
    
    // Test 2: Database Access
    console.log('\n📋 Test 2: Database Access');
    console.log('------------------------');
    
    // Test reading from users table
    console.log('Fetching user profile...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      throw new Error(`User profile fetch failed: ${userError.message}`);
    }
    
    console.log('✅ User profile fetch successful!');
    console.log(`Display Name: ${userData.display_name || 'Not set'}`);
    console.log(`Role: ${userData.role}`);
    console.log(`Created At: ${userData.created_at}`);
    
    // Test 3: Content Management
    console.log('\n📋 Test 3: Content Management');
    console.log('---------------------------');
    
    // Test reading blog posts
    console.log('Fetching blog posts...');
    const { data: postsData, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      throw new Error(`Blog posts fetch failed: ${postsError.message}`);
    }
    
    console.log(`✅ Successfully fetched ${postsData.length} blog posts!`);
    
    // Test creating a test post
    const testPostTitle = `Test Post ${Date.now()}`;
    console.log(`Creating test post: "${testPostTitle}"...`);
    
    const { data: newPost, error: createError } = await supabase
      .from('blog_posts')
      .insert({
        title: testPostTitle,
        content: 'This is a test post created by the validation script.',
        slug: testPostTitle.toLowerCase().replace(/\s+/g, '-'),
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_id: authData.user.id
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Test post creation failed: ${createError.message}`);
    }
    
    console.log('✅ Test post created successfully!');
    console.log(`Post ID: ${newPost.id}`);
    
    // Test 4: Donation Management
    console.log('\n📋 Test 4: Donation Management');
    console.log('----------------------------');
    
    // Test reading donations
    console.log('Fetching donations...');
    const { data: donationsData, error: donationsError } = await supabase
      .from('donations')
      .select('*')
      .limit(5);
    
    if (donationsError) {
      throw new Error(`Donations fetch failed: ${donationsError.message}`);
    }
    
    console.log(`✅ Successfully fetched ${donationsData.length} donations!`);
    
    // Test creating a test donation
    const testDonationId = uuidv4();
    console.log('Creating test donation...');
    
    const { data: newDonation, error: donationCreateError } = await supabase
      .from('donations')
      .insert({
        id: testDonationId,
        amount: 100.00,
        currency: 'USD',
        status: 'COMPLETED',
        payment_method: 'TEST',
        donor_id: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        donation_type: 'ONE_TIME'
      })
      .select()
      .single();
    
    if (donationCreateError) {
      throw new Error(`Test donation creation failed: ${donationCreateError.message}`);
    }
    
    console.log('✅ Test donation created successfully!');
    console.log(`Donation ID: ${newDonation.id}`);
    
    // Test 5: Cleanup
    console.log('\n📋 Test 5: Cleanup');
    console.log('----------------');
    
    // Delete test post
    console.log('Deleting test post...');
    const { error: deletePostError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', newPost.id);
    
    if (deletePostError) {
      throw new Error(`Test post deletion failed: ${deletePostError.message}`);
    }
    
    console.log('✅ Test post deleted successfully!');
    
    // Delete test donation
    console.log('Deleting test donation...');
    const { error: deleteDonationError } = await supabase
      .from('donations')
      .delete()
      .eq('id', testDonationId);
    
    if (deleteDonationError) {
      throw new Error(`Test donation deletion failed: ${deleteDonationError.message}`);
    }
    
    console.log('✅ Test donation deleted successfully!');
    
    // Final summary
    console.log('\n✅ All tests passed successfully!');
    console.log('The Supabase migration validation is complete.');
    console.log('The application appears to be working correctly with Supabase.');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
