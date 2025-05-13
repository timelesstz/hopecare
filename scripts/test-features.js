// @ts-check
// package.json: { "type": "module" }

/**
 * Feature Test Suite for HopeCare Supabase Migration
 * 
 * This script tests key features of the HopeCare application to ensure
 * they work correctly after migrating from Firebase to Supabase.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tkxppievtqiipcsdqbpf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_KEY; // Use the anon key for most operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Validate service key format
if (supabaseServiceKey && !supabaseServiceKey.startsWith('eyJ')) {
  console.warn(chalk.yellow('Warning: Service key appears to be malformed. It should start with "eyJ"'));
}

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('Error: Supabase URL or anon key not found in environment variables.'));
  console.error(chalk.gray(`VITE_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Not found'}`));
  console.error(chalk.gray(`VITE_SUPABASE_KEY: ${supabaseKey ? 'Found' : 'Not found'}`));
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn(chalk.yellow('Warning: Supabase service key not found. Some admin operations may fail.'));
  console.warn(chalk.yellow('Set SUPABASE_SERVICE_ROLE_KEY in your .env file for full test functionality.'));
}

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);

// Create admin client with service role key for bypassing RLS
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Set auth context for RLS policies
let adminSession = null;

console.log(chalk.gray(`Using Supabase URL: ${supabaseUrl}`));
console.log(chalk.gray(`Using admin client: ${supabaseServiceKey ? 'Yes (with service role key)' : 'No (falling back to anon key)'}`));

// Test configuration
const config = {
  adminUser: {
    email: 'admin@hopecaretz.org',
    password: 'Hope@admin2'
  },
  testUser: {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test User'
  }
};

// Track test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

/**
 * Run a test and handle results
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  testResults.total++;
  console.log(chalk.blue(`\nRunning test: ${name}`));
  
  try {
    await testFn();
    console.log(chalk.green(`✓ Passed: ${name}`));
    testResults.passed++;
  } catch (error) {
    console.error(chalk.red(`✗ Failed: ${name}`));
    console.error(chalk.gray(`  Error: ${error.message}`));
    testResults.failed++;
  }
}

/**
 * Skip a test
 * @param {string} name - Test name
 * @param {string} reason - Reason for skipping
 */
function skipTest(name, reason) {
  testResults.total++;
  testResults.skipped++;
  console.log(chalk.yellow(`⚠ Skipped: ${name}`));
  console.log(chalk.gray(`  Reason: ${reason}`));
}

/**
 * Test user authentication
 */
async function testAuthentication() {
  // Test admin login
  console.log('Testing admin login...');
  const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.signInWithPassword({
    email: config.adminUser.email,
    password: config.adminUser.password
  });
  
  if (adminAuthError) {
    throw new Error(`Admin login failed: ${adminAuthError.message}`);
  }
  
  // Store admin session for later use with RLS policies
  adminSession = adminAuth.session;
  
  console.log(chalk.green('✓ Admin login successful'));
  
  // Test user registration...
  console.log('Testing user registration...');
  
  let newUser, signUpError;
  
  // Check if we have a service role key before using admin methods
  if (supabaseServiceKey) {
    // First create the auth user using admin methods
    const result = await supabaseAdmin.auth.admin.createUser({
      email: config.testUser.email,
      password: config.testUser.password,
      email_confirm: true
    });
    newUser = result.data;
    signUpError = result.error;
  } else {
    // Fallback to regular signup if no service role key
    console.log(chalk.yellow('No service role key available, using regular signup'));
    const result = await supabase.auth.signUp({
      email: config.testUser.email,
      password: config.testUser.password,
      options: {
        data: {
          name: config.testUser.displayName,
        }
      }
    });
    newUser = result.data;
    signUpError = result.error;
  }
  
  if (signUpError) {
    throw new Error(`User registration failed: ${signUpError.message}`);
  }
  
  console.log(chalk.green('✓ User registration successful'));
  
  // Create user profile
  if (newUser?.user) {
    console.log('Creating user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email: config.testUser.email,
        display_name: config.testUser.displayName,
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      throw new Error(`Creating user profile failed: ${profileError.message}`);
    }
    
    console.log(chalk.green('✓ User profile created'));
  }
  
  // Test sign out
  console.log('Testing sign out...');
  const { error: signOutError } = await supabase.auth.signOut();
  
  if (signOutError) {
    throw new Error(`Sign out failed: ${signOutError.message}`);
  }
  
  console.log(chalk.green('✓ Sign out successful'));
  
  // Clean up test user
  if (newUser?.user) {
    console.log('Cleaning up test user...');
    
    let deleteAuthError;
    
    // Check if we have a service role key before using admin methods
    if (supabaseServiceKey) {
      // Use admin methods to delete the user
      const result = await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      deleteAuthError = result.error;
    } else {
      console.warn(chalk.yellow(`Cannot delete test user: No service role key available`));
      console.warn(chalk.yellow(`The test user ${config.testUser.email} will remain in the database`));
      // Skip deletion attempt without service role key
      deleteAuthError = null;
    }
    
    if (deleteAuthError) {
      console.warn(chalk.yellow(`Warning: Failed to delete test user: ${deleteAuthError.message}`));
    } else if (supabaseServiceKey) {
      console.log(chalk.green('✓ Test user deleted'));
    }
  }
}

/**
 * Test donation management
 */
async function testDonationManagement() {
  // Use existing admin session if available, otherwise sign in again
  let adminId;
  
  if (adminSession) {
    adminId = adminSession.user.id;
    console.log(chalk.gray('Using existing admin session'));
  } else {
    console.log('Signing in as admin...');
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (adminAuthError) {
      throw new Error(`Admin login failed: ${adminAuthError.message}`);
    }
    
    adminId = adminAuth.user.id;
    adminSession = adminAuth.session;
  }
  
  // Create test donor
  console.log('Creating test donor...');
  const testDonorEmail = `donor-${Date.now()}@example.com`;
  
  // Use admin client with service role to create user
  const { data: donorUser, error: donorError } = await supabaseAdmin.auth.admin.createUser({
    email: testDonorEmail,
    password: 'DonorTest123!',
    email_confirm: true
  });
  
  if (donorError) {
    console.error(chalk.red(`Error details: ${JSON.stringify(donorError)}`));
  }
  
  if (donorError) {
    throw new Error(`Creating donor user failed: ${donorError.message}`);
  }
  
  const donorId = donorUser.user.id;
  
  // Create donor profile - use admin client to bypass RLS
  const { error: donorProfileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: donorId,
      email: testDonorEmail,
      display_name: 'Test Donor',
      role: 'DONOR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (donorProfileError) {
    console.error(chalk.red(`Error details: ${JSON.stringify(donorProfileError)}`));
  }
  
  if (donorProfileError) {
    throw new Error(`Creating donor profile failed: ${donorProfileError.message}`);
  }
  
  // Create donor details - use admin client to bypass RLS
  const { error: donorDetailsError } = await supabaseAdmin
    .from('donor_profiles')
    .insert({
      user_id: donorId,
      full_name: 'Test Donor',
      contact_email: testDonorEmail,
      contact_phone: '+1234567890',
      address: '123 Test St',
      donation_frequency: 'ONE_TIME'
    });
  
  if (donorDetailsError) {
    throw new Error(`Creating donor details failed: ${donorDetailsError.message}`);
  }
  
  console.log(chalk.green('✓ Test donor created'));
  
  // Create test donation
  console.log('Creating test donation...');
  const donationId = uuidv4();
  
  const { error: donationError } = await supabase
    .from('donations')
    .insert({
      id: donationId,
      donor_id: donorId,
      amount: 100,
      currency: 'USD',
      status: 'COMPLETED',
      payment_method: 'CREDIT_CARD',
      project_id: null,
      is_anonymous: false,
      created_at: new Date().toISOString()
    });
  
  if (donationError) {
    throw new Error(`Creating donation failed: ${donationError.message}`);
  }
  
  console.log(chalk.green('✓ Test donation created'));
  
  // Retrieve donation
  console.log('Retrieving donation...');
  const { data: donation, error: getDonationError } = await supabase
    .from('donations')
    .select('*')
    .eq('id', donationId)
    .single();
  
  if (getDonationError) {
    throw new Error(`Retrieving donation failed: ${getDonationError.message}`);
  }
  
  if (!donation) {
    throw new Error('Donation not found');
  }
  
  console.log(chalk.green('✓ Donation retrieved successfully'));
  
  // Update donation
  console.log('Updating donation...');
  const { error: updateError } = await supabase
    .from('donations')
    .update({ amount: 150 })
    .eq('id', donationId);
  
  if (updateError) {
    throw new Error(`Updating donation failed: ${updateError.message}`);
  }
  
  console.log(chalk.green('✓ Donation updated successfully'));
  
  // Clean up
  console.log('Cleaning up test data...');
  
  // Delete donation
  await supabase.from('donations').delete().eq('id', donationId);
  
  // Delete donor profile
  await supabase.from('donor_profiles').delete().eq('user_id', donorId);
  
  // Delete user
  await supabase.from('users').delete().eq('id', donorId);
  
  // Delete auth user
  await supabaseAdmin.auth.admin.deleteUser(donorId);
  
  console.log(chalk.green('✓ Test data cleaned up'));
}

/**
 * Test project management
 */
async function testProjectManagement() {
  // Use existing admin session if available, otherwise sign in again
  let adminId;
  
  if (adminSession) {
    adminId = adminSession.user.id;
    console.log(chalk.gray('Using existing admin session'));
  } else {
    console.log('Signing in as admin...');
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (adminAuthError) {
      throw new Error(`Admin login failed: ${adminAuthError.message}`);
    }
    
    adminId = adminAuth.user.id;
    adminSession = adminAuth.session;
  }
  
  // Create test project - use admin client to bypass RLS
  console.log('Creating test project...');
  const projectId = uuidv4();
  
  const { error: projectError } = await supabaseAdmin
    .from('projects')
    .insert({
      id: projectId,
      title: 'Test Project',
      description: 'A test project for feature testing',
      status: 'ACTIVE',
      target_amount: 5000,
      current_amount: 0,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: adminId,
      created_at: new Date().toISOString()
    });
  
  if (projectError) {
    throw new Error(`Creating project failed: ${projectError.message}`);
  }
  
  console.log(chalk.green('✓ Test project created'));
  
  // Retrieve project
  console.log('Retrieving project...');
  const { data: project, error: getProjectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (getProjectError) {
    throw new Error(`Retrieving project failed: ${getProjectError.message}`);
  }
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  console.log(chalk.green('✓ Project retrieved successfully'));
  
  // Update project
  console.log('Updating project...');
  const { error: updateError } = await supabase
    .from('projects')
    .update({ 
      title: 'Updated Test Project',
      current_amount: 1000
    })
    .eq('id', projectId);
  
  if (updateError) {
    throw new Error(`Updating project failed: ${updateError.message}`);
  }
  
  console.log(chalk.green('✓ Project updated successfully'));
  
  // Clean up
  console.log('Cleaning up test data...');
  
  // Delete project
  await supabase.from('projects').delete().eq('id', projectId);
  
  console.log(chalk.green('✓ Test data cleaned up'));
}

/**
 * Test volunteer management
 */
async function testVolunteerManagement() {
  // Use existing admin session if available, otherwise sign in again
  let adminId;
  
  if (adminSession) {
    adminId = adminSession.user.id;
    console.log(chalk.gray('Using existing admin session'));
  } else {
    console.log('Signing in as admin...');
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (adminAuthError) {
      throw new Error(`Admin login failed: ${adminAuthError.message}`);
    }
    
    adminId = adminAuth.user.id;
    adminSession = adminAuth.session;
  }
  
  // Create test volunteer
  console.log('Creating test volunteer...');
  const testVolunteerEmail = `volunteer-${Date.now()}@example.com`;
  
  // Use admin client with service role to create user
  const { data: volunteerUser, error: volunteerError } = await supabaseAdmin.auth.admin.createUser({
    email: testVolunteerEmail,
    password: 'VolunteerTest123!',
    email_confirm: true
  });
  
  if (volunteerError) {
    console.error(chalk.red(`Error details: ${JSON.stringify(volunteerError)}`));
  }
  
  if (volunteerError) {
    throw new Error(`Creating volunteer user failed: ${volunteerError.message}`);
  }
  
  const volunteerId = volunteerUser.user.id;
  
  // Create volunteer profile - use admin client to bypass RLS
  const { error: volunteerProfileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: volunteerId,
      email: testVolunteerEmail,
      display_name: 'Test Volunteer',
      role: 'VOLUNTEER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (volunteerProfileError) {
    console.error(chalk.red(`Error details: ${JSON.stringify(volunteerProfileError)}`));
  }
  
  if (volunteerProfileError) {
    throw new Error(`Creating volunteer profile failed: ${volunteerProfileError.message}`);
  }
  
  // Create volunteer details - use admin client to bypass RLS
  const { error: volunteerDetailsError } = await supabaseAdmin
    .from('volunteer_profiles')
    .insert({
      user_id: volunteerId,
      full_name: 'Test Volunteer',
      contact_email: testVolunteerEmail,
      contact_phone: '+1234567890',
      skills: ['teaching', 'organizing'],
      availability: 'WEEKENDS',
      status: 'ACTIVE'
    });
  
  if (volunteerDetailsError) {
    throw new Error(`Creating volunteer details failed: ${volunteerDetailsError.message}`);
  }
  
  console.log(chalk.green('✓ Test volunteer created'));
  
  // Create volunteer opportunity - use admin client to bypass RLS
  console.log('Creating volunteer opportunity...');
  const opportunityId = uuidv4();
  
  const { error: opportunityError } = await supabaseAdmin
    .from('volunteer_opportunities')
    .insert({
      id: opportunityId,
      title: 'Test Opportunity',
      description: 'A test volunteer opportunity',
      requirements: ['teaching experience'],
      location: 'Test Location',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'OPEN',
      created_by: adminId,
      created_at: new Date().toISOString()
    });
  
  if (opportunityError) {
    throw new Error(`Creating opportunity failed: ${opportunityError.message}`);
  }
  
  console.log(chalk.green('✓ Test opportunity created'));
  
  // Create application - use admin client to bypass RLS
  console.log('Creating volunteer application...');
  const applicationId = uuidv4();
  
  const { error: applicationError } = await supabaseAdmin
    .from('volunteer_applications')
    .insert({
      id: applicationId,
      volunteer_id: volunteerId,
      opportunity_id: opportunityId,
      status: 'PENDING',
      message: 'I would like to apply for this opportunity',
      created_at: new Date().toISOString()
    });
  
  if (applicationError) {
    throw new Error(`Creating application failed: ${applicationError.message}`);
  }
  
  console.log(chalk.green('✓ Test application created'));
  
  // Update application status - use admin client to bypass RLS
  console.log('Updating application status...');
  const { error: updateError } = await supabaseAdmin
    .from('volunteer_applications')
    .update({ status: 'APPROVED' })
    .eq('id', applicationId);
  
  if (updateError) {
    throw new Error(`Updating application failed: ${updateError.message}`);
  }
  
  console.log(chalk.green('✓ Application updated successfully'));
  
  // Clean up
  console.log('Cleaning up test data...');
  
  // Delete application
  await supabase.from('volunteer_applications').delete().eq('id', applicationId);
  
  // Delete opportunity
  await supabase.from('volunteer_opportunities').delete().eq('id', opportunityId);
  
  // Delete volunteer profile
  await supabase.from('volunteer_profiles').delete().eq('user_id', volunteerId);
  
  // Delete user
  await supabase.from('users').delete().eq('id', volunteerId);
  
  // Delete auth user
  await supabaseAdmin.auth.admin.deleteUser(volunteerId);
  
  console.log(chalk.green('✓ Test data cleaned up'));
}

/**
 * Test content management
 */
async function testContentManagement() {
  // Use existing admin session if available, otherwise sign in again
  let adminId;
  
  if (adminSession) {
    adminId = adminSession.user.id;
    console.log(chalk.gray('Using existing admin session'));
  } else {
    console.log('Signing in as admin...');
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (adminAuthError) {
      throw new Error(`Admin login failed: ${adminAuthError.message}`);
    }
    
    adminId = adminAuth.user.id;
    adminSession = adminAuth.session;
  }
  
  // Create test blog post - use admin client to bypass RLS
  console.log('Creating test blog post...');
  const postId = uuidv4();
  
  const { error: postError } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      id: postId,
      title: 'Test Blog Post',
      content: 'This is a test blog post for feature testing',
      status: 'PUBLISHED',
      author_id: adminId,
      slug: `test-blog-post-${Date.now()}`,
      excerpt: 'A short excerpt for testing',
      featured_image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (postError) {
    throw new Error(`Creating blog post failed: ${postError.message}`);
  }
  
  console.log(chalk.green('✓ Test blog post created'));
  
  // Retrieve blog post
  console.log('Retrieving blog post...');
  const { data: post, error: getPostError } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .single();
  
  if (getPostError) {
    throw new Error(`Retrieving blog post failed: ${getPostError.message}`);
  }
  
  if (!post) {
    throw new Error('Blog post not found');
  }
  
  console.log(chalk.green('✓ Blog post retrieved successfully'));
  
  // Create test page - use admin client to bypass RLS
  console.log('Creating test page...');
  const pageId = uuidv4();
  
  const { error: pageError } = await supabaseAdmin
    .from('pages')
    .insert({
      id: pageId,
      title: 'Test Page',
      content: 'This is a test page for feature testing',
      status: 'PUBLISHED',
      author_id: adminId,
      slug: `test-page-${Date.now()}`,
      meta_description: 'A test page meta description',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (pageError) {
    throw new Error(`Creating page failed: ${pageError.message}`);
  }
  
  console.log(chalk.green('✓ Test page created'));
  
  // Retrieve page
  console.log('Retrieving page...');
  const { data: page, error: getPageError } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();
  
  if (getPageError) {
    throw new Error(`Retrieving page failed: ${getPageError.message}`);
  }
  
  if (!page) {
    throw new Error('Page not found');
  }
  
  console.log(chalk.green('✓ Page retrieved successfully'));
  
  // Create content revision - use admin client to bypass RLS
  console.log('Creating content revision...');
  const revisionId = uuidv4();
  
  const { error: revisionError } = await supabaseAdmin
    .from('content_revisions')
    .insert({
      id: revisionId,
      content_id: postId,
      content_type: 'BLOG_POST',
      revision_data: {
        title: 'Updated Test Blog Post',
        content: 'This is an updated test blog post for feature testing',
        excerpt: 'An updated short excerpt for testing'
      },
      created_by: adminId,
      created_at: new Date().toISOString()
    });
  
  if (revisionError) {
    throw new Error(`Creating content revision failed: ${revisionError.message}`);
  }
  
  console.log(chalk.green('✓ Content revision created'));
  
  // Update blog post with revision - use admin client to bypass RLS
  console.log('Updating blog post with revision...');
  const { error: updateError } = await supabaseAdmin
    .from('blog_posts')
    .update({
      title: 'Updated Test Blog Post',
      content: 'This is an updated test blog post for feature testing',
      excerpt: 'An updated short excerpt for testing',
      updated_at: new Date().toISOString()
    })
    .eq('id', postId);
  
  if (updateError) {
    throw new Error(`Updating blog post failed: ${updateError.message}`);
  }
  
  console.log(chalk.green('✓ Blog post updated successfully'));
  
  // Clean up
  console.log('Cleaning up test data...');
  
  // Delete content revision
  await supabase.from('content_revisions').delete().eq('id', revisionId);
  
  // Delete blog post
  await supabase.from('blog_posts').delete().eq('id', postId);
  
  // Delete page
  await supabase.from('pages').delete().eq('id', pageId);
  
  console.log(chalk.green('✓ Test data cleaned up'));
}

async function runTests() {
  console.log(chalk.blue('=== HopeCare Feature Test Suite ==='));
  console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}`));
  console.log(chalk.gray(`Supabase URL: ${supabaseUrl}`));
  
  try {
    // Authentication tests - must run first to set up admin session
    await runTest('Authentication', testAuthentication);
    
    // Skip remaining tests if authentication failed
    if (testResults.failed > 0 && !adminSession) {
      console.log(chalk.yellow('\nSkipping remaining tests due to authentication failure'));
      skipTest('Donation Management', 'Authentication failed');
      skipTest('Project Management', 'Authentication failed');
      skipTest('Volunteer Management', 'Authentication failed');
      skipTest('Content Management', 'Authentication failed');
    } else {
      // Donation management tests
      await runTest('Donation Management', testDonationManagement);
      
      // Project management tests
      await runTest('Project Management', testProjectManagement);
      
      // Volunteer management tests
      await runTest('Volunteer Management', testVolunteerManagement);
      
      // Content management tests
      await runTest('Content Management', testContentManagement);
    }
    
    // Print test results
    console.log(chalk.blue('\n=== Test Results ==='));
    console.log(chalk.green(`Passed: ${testResults.passed}/${testResults.total}`));
    
    if (testResults.failed > 0) {
      console.log(chalk.red(`Failed: ${testResults.failed}/${testResults.total}`));
    }
    
    if (testResults.skipped > 0) {
      console.log(chalk.yellow(`Skipped: ${testResults.skipped}/${testResults.total}`));
    }
    
  } catch (error) {
    console.error(chalk.red(`\nTest suite failed: ${error.message}`));
  }
  
  console.log(chalk.blue('\n=== Test Suite Complete ==='));
  console.log(chalk.gray(`Finished at: ${new Date().toLocaleString()}`));
}

// Run the tests
runTests().catch(console.error);
