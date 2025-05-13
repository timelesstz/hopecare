// Supabase Database Access Test Suite
// This script validates the database functionality after the Supabase migration.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Admin credentials for authentication
const adminEmail = 'admin@hopecaretz.org';
const adminPassword = 'Hope@admin2';

// Initialize results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data for database operations
const testData = {
  post: {
    id: null,
    title: `Test Post ${Date.now()}`,
    content: 'This is a test post created by the database test suite.',
    slug: `test-post-${Date.now()}`,
  },
  page: {
    id: null,
    title: `Test Page ${Date.now()}`,
    content: 'This is a test page created by the database test suite.',
    slug: `test-page-${Date.now()}`,
  },
  donation: {
    id: uuidv4(),
    amount: 50.00,
    currency: 'USD',
    status: 'COMPLETED',
    payment_method: 'TEST',
  },
  volunteer: {
    id: uuidv4(),
    first_name: 'Test',
    last_name: 'Volunteer',
    email: `test.volunteer.${Date.now()}@example.com`,
  }
};

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
async function runDatabaseTests() {
  console.log(chalk.yellow.bold('\n=== SUPABASE DATABASE TESTS ===\n'));
  
  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(chalk.red('Error: Supabase URL and anon key are required.'));
    console.error(chalk.red('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'));
    process.exit(1);
  }
  
  // Sign in as admin
  await runTest('Admin Sign In', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) throw new Error(`Admin sign in failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned after sign in');
    
    console.log(chalk.gray(`  User ID: ${data.user.id}`));
    testData.userId = data.user.id;
  });
  
  // Test 1: Query Users Table
  await runTest('Query Users Table', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) throw new Error(`Users query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No users found in database');
    
    console.log(chalk.gray(`  Found ${data.length} users`));
    console.log(chalk.gray(`  First user: ${data[0].display_name || data[0].email}`));
  });
  
  // Test 2: Create Blog Post
  await runTest('Create Blog Post', async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: testData.post.title,
        content: testData.post.content,
        slug: testData.post.slug,
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_id: testData.userId
      })
      .select()
      .single();
    
    if (error) throw new Error(`Blog post creation failed: ${error.message}`);
    if (!data) throw new Error('No data returned after blog post creation');
    
    console.log(chalk.gray(`  Created post ID: ${data.id}`));
    testData.post.id = data.id;
  });
  
  // Test 3: Query Blog Posts
  await runTest('Query Blog Posts', async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(`Blog posts query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No blog posts found in database');
    
    console.log(chalk.gray(`  Found ${data.length} blog posts`));
    console.log(chalk.gray(`  Most recent post: ${data[0].title}`));
  });
  
  // Test 4: Update Blog Post
  await runTest('Update Blog Post', async () => {
    const updatedTitle = `${testData.post.title} (Updated)`;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title: updatedTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', testData.post.id)
      .select()
      .single();
    
    if (error) throw new Error(`Blog post update failed: ${error.message}`);
    if (!data) throw new Error('No data returned after blog post update');
    if (data.title !== updatedTitle) throw new Error(`Title not updated correctly. Expected: ${updatedTitle}, Got: ${data.title}`);
    
    console.log(chalk.gray(`  Updated post title to: ${data.title}`));
  });
  
  // Test 5: Create Page
  await runTest('Create Page', async () => {
    const { data, error } = await supabase
      .from('pages')
      .insert({
        title: testData.page.title,
        content: testData.page.content,
        slug: testData.page.slug,
        status: 'DRAFT',
        template: 'DEFAULT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_id: testData.userId
      })
      .select()
      .single();
    
    if (error) throw new Error(`Page creation failed: ${error.message}`);
    if (!data) throw new Error('No data returned after page creation');
    
    console.log(chalk.gray(`  Created page ID: ${data.id}`));
    testData.page.id = data.id;
  });
  
  // Test 6: Query Pages
  await runTest('Query Pages', async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(`Pages query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No pages found in database');
    
    console.log(chalk.gray(`  Found ${data.length} pages`));
    console.log(chalk.gray(`  Most recent page: ${data[0].title}`));
  });
  
  // Test 7: Create Donation
  await runTest('Create Donation', async () => {
    const { data, error } = await supabase
      .from('donations')
      .insert({
        id: testData.donation.id,
        amount: testData.donation.amount,
        currency: testData.donation.currency,
        status: testData.donation.status,
        payment_method: testData.donation.payment_method,
        donor_id: testData.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        donation_type: 'ONE_TIME'
      })
      .select()
      .single();
    
    if (error) throw new Error(`Donation creation failed: ${error.message}`);
    if (!data) throw new Error('No data returned after donation creation');
    
    console.log(chalk.gray(`  Created donation ID: ${data.id}`));
  });
  
  // Test 8: Query Donations
  await runTest('Query Donations', async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(`Donations query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No donations found in database');
    
    console.log(chalk.gray(`  Found ${data.length} donations`));
    console.log(chalk.gray(`  Most recent donation: $${data[0].amount} ${data[0].currency}`));
  });
  
  // Test 9: Create Volunteer Opportunity
  await runTest('Create Volunteer Opportunity', async () => {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert({
        title: `Test Opportunity ${Date.now()}`,
        description: 'This is a test opportunity created by the database test suite.',
        location: 'Test Location',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: testData.userId
      })
      .select()
      .single();
    
    if (error) throw new Error(`Volunteer opportunity creation failed: ${error.message}`);
    if (!data) throw new Error('No data returned after volunteer opportunity creation');
    
    console.log(chalk.gray(`  Created opportunity ID: ${data.id}`));
    testData.opportunity = { id: data.id };
  });
  
  // Test 10: Query Volunteer Opportunities
  await runTest('Query Volunteer Opportunities', async () => {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(`Volunteer opportunities query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No volunteer opportunities found in database');
    
    console.log(chalk.gray(`  Found ${data.length} volunteer opportunities`));
    console.log(chalk.gray(`  Most recent opportunity: ${data[0].title}`));
  });
  
  // Test 11: Test RLS Policies (Negative Test)
  await runTest('Test RLS Policies (Sign Out)', async () => {
    // Sign out first
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw new Error(`Sign out failed: ${signOutError.message}`);
    
    console.log(chalk.gray('  Signed out successfully'));
  });
  
  await runTest('Test RLS Policies (Unauthorized Access)', async () => {
    // Try to access blog posts without authentication
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', testData.post.id);
    
    // We expect this to either return no rows or an error due to RLS
    if (error) {
      console.log(chalk.gray(`  Access denied as expected: ${error.message}`));
    } else if (!data || data.length === 0) {
      console.log(chalk.gray('  No data returned as expected due to RLS'));
    } else {
      throw new Error('RLS policy failed: Unauthenticated user could access restricted data');
    }
  });
  
  // Test 12: Sign back in as admin for cleanup
  await runTest('Sign Back In As Admin', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) throw new Error(`Admin sign in failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned after sign in');
    
    console.log(chalk.gray(`  Signed back in as admin`));
  });
  
  // Test 13: Cleanup - Delete Test Data
  await runTest('Cleanup - Delete Test Blog Post', async () => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', testData.post.id);
    
    if (error) throw new Error(`Blog post deletion failed: ${error.message}`);
    
    console.log(chalk.gray(`  Deleted test blog post`));
  });
  
  await runTest('Cleanup - Delete Test Page', async () => {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', testData.page.id);
    
    if (error) throw new Error(`Page deletion failed: ${error.message}`);
    
    console.log(chalk.gray(`  Deleted test page`));
  });
  
  await runTest('Cleanup - Delete Test Donation', async () => {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', testData.donation.id);
    
    if (error) throw new Error(`Donation deletion failed: ${error.message}`);
    
    console.log(chalk.gray(`  Deleted test donation`));
  });
  
  await runTest('Cleanup - Delete Test Volunteer Opportunity', async () => {
    const { error } = await supabase
      .from('volunteer_opportunities')
      .delete()
      .eq('id', testData.opportunity.id);
    
    if (error) throw new Error(`Volunteer opportunity deletion failed: ${error.message}`);
    
    console.log(chalk.gray(`  Deleted test volunteer opportunity`));
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
    console.log(chalk.green.bold('\n✅ All database tests passed!'));
  }
}

// Run the tests
runDatabaseTests().catch(error => {
  console.error(chalk.red(`\nUnhandled error: ${error.message}`));
  process.exit(1);
});
