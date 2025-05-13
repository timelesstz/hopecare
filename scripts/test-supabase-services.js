/**
 * Supabase Services Test Script
 * 
 * This script provides a way to test the Supabase services we've implemented.
 * It can be used to validate the migration from Firebase to Supabase.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for testing

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const config = {
  // Set to true to run specific tests
  tests: {
    users: true,
    donors: true,
    volunteers: true,
    content: true,
    admin: true
  },
  // Admin user for testing (should exist in the database)
  adminUser: {
    email: 'admin@hopecaretz.org',
    password: 'Hope@admin2'
  }
};

/**
 * Test user service functionality
 */
async function testUserService() {
  console.log('\n=== Testing User Service ===');
  
  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    console.log(`Signed in as ${authData.user.email}`);
    
    // Get user profile
    console.log('Getting user profile...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      throw new Error(`Failed to get user profile: ${userError.message}`);
    }
    
    console.log('User profile:', userData);
    
    // Test user role
    console.log('Testing user role...');
    if (userData.role !== 'ADMIN') {
      throw new Error(`Expected user role to be ADMIN, got ${userData.role}`);
    }
    
    console.log('User role is correct');
    
    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}...`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Password123!',
      email_confirm: true
    });
    
    if (createError) {
      throw new Error(`Failed to create test user: ${createError.message}`);
    }
    
    console.log(`Created test user with ID: ${newUser.user.id}`);
    
    // Insert user record in public.users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: testEmail,
        display_name: 'Test User',
        role: 'USER',
        firebase_uid: `firebase-${Date.now()}`
      });
    
    if (insertError) {
      throw new Error(`Failed to insert user record: ${insertError.message}`);
    }
    
    console.log('Inserted user record in public.users table');
    
    // Log activity
    console.log('Logging user activity...');
    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: authData.user.id,
        action: 'test_script',
        entity_type: 'test',
        metadata: { test: 'user_service' }
      });
    
    if (activityError) {
      throw new Error(`Failed to log activity: ${activityError.message}`);
    }
    
    console.log('Activity logged successfully');
    
    // Clean up test user
    console.log('Cleaning up test user...');
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(newUser.user.id);
    
    if (deleteAuthError) {
      console.warn(`Warning: Failed to delete test user from auth: ${deleteAuthError.message}`);
    } else {
      console.log('Deleted test user from auth.users');
    }
    
    console.log('User service tests completed successfully');
    return true;
  } catch (error) {
    console.error('User service test failed:', error);
    return false;
  }
}

/**
 * Test donor service functionality
 */
async function testDonorService() {
  console.log('\n=== Testing Donor Service ===');
  
  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    // Get a test user or create one
    console.log('Getting or creating test user...');
    let testUserId;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'USER')
      .limit(1)
      .single();
    
    if (existingUser) {
      testUserId = existingUser.id;
      console.log(`Using existing user with ID: ${testUserId}`);
    } else {
      // Create a test user
      const testEmail = `donor-test-${Date.now()}@example.com`;
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Failed to create test user: ${createError.message}`);
      }
      
      testUserId = newUser.user.id;
      
      // Insert user record in public.users table
      await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: testEmail,
          display_name: 'Test Donor',
          role: 'USER'
        });
      
      console.log(`Created test user with ID: ${testUserId}`);
    }
    
    // Create donor profile
    console.log('Creating donor profile...');
    const donorProfile = {
      user_id: testUserId,
      full_name: 'Test Donor',
      email: 'test-donor@example.com',
      phone: '+1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'Test Country',
      donation_preference: 'monthly',
      anonymous: false
    };
    
    const { data: donor, error: donorError } = await supabase
      .from('donor_profiles')
      .upsert(donorProfile)
      .select()
      .single();
    
    if (donorError) {
      throw new Error(`Failed to create donor profile: ${donorError.message}`);
    }
    
    console.log(`Created/updated donor profile with ID: ${donor.id}`);
    
    // Create a test donation
    console.log('Creating test donation...');
    const donation = {
      donor_id: donor.id,
      amount: 100,
      currency: 'USD',
      payment_method: 'card',
      status: 'completed',
      donation_type: 'one-time',
      campaign: 'test-campaign',
      notes: 'Test donation from script'
    };
    
    const { data: newDonation, error: donationError } = await supabase
      .from('donations')
      .insert(donation)
      .select()
      .single();
    
    if (donationError) {
      throw new Error(`Failed to create donation: ${donationError.message}`);
    }
    
    console.log(`Created donation with ID: ${newDonation.id}`);
    
    // Add donation metadata
    console.log('Adding donation metadata...');
    const metadata = {
      donation_id: newDonation.id,
      key: 'source',
      value: 'test-script'
    };
    
    const { error: metadataError } = await supabase
      .from('donation_metadata')
      .insert(metadata);
    
    if (metadataError) {
      throw new Error(`Failed to add donation metadata: ${metadataError.message}`);
    }
    
    console.log('Added donation metadata');
    
    // Get donation statistics
    console.log('Getting donation statistics...');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_donation_statistics');
    
    if (statsError) {
      throw new Error(`Failed to get donation statistics: ${statsError.message}`);
    }
    
    console.log('Donation statistics:', stats);
    
    console.log('Donor service tests completed successfully');
    return true;
  } catch (error) {
    console.error('Donor service test failed:', error);
    return false;
  }
}

/**
 * Test volunteer service functionality
 */
async function testVolunteerService() {
  console.log('\n=== Testing Volunteer Service ===');
  
  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    // Get a test user or create one
    console.log('Getting or creating test user...');
    let testUserId;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'USER')
      .limit(1)
      .single();
    
    if (existingUser) {
      testUserId = existingUser.id;
      console.log(`Using existing user with ID: ${testUserId}`);
    } else {
      // Create a test user
      const testEmail = `volunteer-test-${Date.now()}@example.com`;
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Failed to create test user: ${createError.message}`);
      }
      
      testUserId = newUser.user.id;
      
      // Insert user record in public.users table
      await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: testEmail,
          display_name: 'Test Volunteer',
          role: 'USER'
        });
      
      console.log(`Created test user with ID: ${testUserId}`);
    }
    
    // Create volunteer profile
    console.log('Creating volunteer profile...');
    const volunteerProfile = {
      user_id: testUserId,
      full_name: 'Test Volunteer',
      email: 'test-volunteer@example.com',
      phone: '+1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'Test Country',
      skills: ['test', 'coding', 'documentation'],
      availability: ['weekends', 'evenings'],
      status: 'active'
    };
    
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteer_profiles')
      .upsert(volunteerProfile)
      .select()
      .single();
    
    if (volunteerError) {
      throw new Error(`Failed to create volunteer profile: ${volunteerError.message}`);
    }
    
    console.log(`Created/updated volunteer profile with ID: ${volunteer.id}`);
    
    // Create a test certification
    console.log('Creating test certification...');
    const certification = {
      volunteer_id: volunteer.id,
      name: 'Test Certification',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 31536000000).toISOString().split('T')[0] // 1 year from now
    };
    
    const { data: newCertification, error: certError } = await supabase
      .from('volunteer_certifications')
      .insert(certification)
      .select()
      .single();
    
    if (certError) {
      throw new Error(`Failed to create certification: ${certError.message}`);
    }
    
    console.log(`Created certification with ID: ${newCertification.id}`);
    
    // Create a test opportunity
    console.log('Creating test opportunity...');
    const opportunity = {
      title: 'Test Opportunity',
      description: 'Test opportunity created by script',
      location: 'Test Location',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      required_skills: ['test', 'coding'],
      status: 'open',
      created_by: authData.user.id
    };
    
    const { data: newOpportunity, error: oppError } = await supabase
      .from('opportunities')
      .insert(opportunity)
      .select()
      .single();
    
    if (oppError) {
      throw new Error(`Failed to create opportunity: ${oppError.message}`);
    }
    
    console.log(`Created opportunity with ID: ${newOpportunity.id}`);
    
    // Create a test application
    console.log('Creating test application...');
    const application = {
      volunteer_id: volunteer.id,
      opportunity_id: newOpportunity.id,
      status: 'pending',
      message: 'Test application from script'
    };
    
    const { data: newApplication, error: appError } = await supabase
      .from('volunteer_applications')
      .insert(application)
      .select()
      .single();
    
    if (appError) {
      throw new Error(`Failed to create application: ${appError.message}`);
    }
    
    console.log(`Created application with ID: ${newApplication.id}`);
    
    // Log volunteer hours
    console.log('Logging volunteer hours...');
    const hours = {
      volunteer_id: volunteer.id,
      opportunity_id: newOpportunity.id,
      hours: 2,
      activity_date: new Date().toISOString().split('T')[0],
      description: 'Test hours from script',
      status: 'pending'
    };
    
    const { data: newHours, error: hoursError } = await supabase
      .from('volunteer_hours')
      .insert(hours)
      .select()
      .single();
    
    if (hoursError) {
      throw new Error(`Failed to log hours: ${hoursError.message}`);
    }
    
    console.log(`Logged hours with ID: ${newHours.id}`);
    
    console.log('Volunteer service tests completed successfully');
    return true;
  } catch (error) {
    console.error('Volunteer service test failed:', error);
    return false;
  }
}

/**
 * Test content service functionality
 */
async function testContentService() {
  console.log('\n=== Testing Content Service ===');
  
  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    // Test blog post creation
    console.log('Testing blog post creation...');
    const testPostSlug = `test-post-${Date.now()}`;
    const testPost = {
      title: 'Test Blog Post',
      slug: testPostSlug,
      content: '<p>This is a test blog post created by the test script.</p>',
      content: { 
        type: 'doc', 
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is a test blog post.' }] }] 
      },
      excerpt: 'Test blog post excerpt',
      author_id: authData.user.id,
      status: 'published',
      categories: ['test'],
      tags: ['test', 'script'],
      published_at: new Date().toISOString(),
      revision_count: 1
    };
    
    const { data: newPost, error: postError } = await supabase
      .from('blog_posts')
      .insert(blogPost)
      .select()
      .single();
    
    if (postError) {
      throw new Error(`Failed to create blog post: ${postError.message}`);
    }
    
    console.log(`Created blog post with ID: ${newPost.id}`);
    
    // Create initial revision
    console.log('Creating blog post revision...');
    const postRevision = {
      content_type: 'blog_post',
      content_id: newPost.id,
      content: blogPost.content,
      revision_number: 1,
      created_by: authData.user.id
    };
    
    const { error: postRevError } = await supabase
      .from('content_revisions')
      .insert(postRevision);
    
    if (postRevError) {
      throw new Error(`Failed to create blog post revision: ${postRevError.message}`);
    }
    
    console.log('Created blog post revision');
    
    // Create a test page
    console.log('Creating test page...');
    const page = {
      title: `Test Page ${Date.now()}`,
      slug: `test-page-${Date.now()}`,
      content: { 
        type: 'doc', 
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is a test page.' }] }] 
      },
      meta_description: 'Test page description',
      author_id: authData.user.id,
      status: 'published',
      template: 'default',
      sort_order: 0,
      revision_count: 1
    };
    
    const { data: newPage, error: pageError } = await supabase
      .from('pages')
      .insert(page)
      .select()
      .single();
    
    if (pageError) {
      throw new Error(`Failed to create page: ${pageError.message}`);
    }
    
    console.log(`Created page with ID: ${newPage.id}`);
    
    // Create initial revision
    console.log('Creating page revision...');
    const pageRevision = {
      content_type: 'page',
      content_id: newPage.id,
      content: page.content,
      revision_number: 1,
      created_by: authData.user.id
    };
    
    const { error: pageRevError } = await supabase
      .from('content_revisions')
      .insert(pageRevision);
    
    if (pageRevError) {
      throw new Error(`Failed to create page revision: ${pageRevError.message}`);
    }
    
    console.log('Created page revision');
    
    // Update system settings
    console.log('Updating system settings...');
    const setting = {
      key: 'test_setting',
      value: { test: true, timestamp: Date.now() }
    };
    
    const { error: settingError } = await supabase
      .from('system_settings')
      .upsert(setting);
    
    if (settingError) {
      throw new Error(`Failed to update system setting: ${settingError.message}`);
    }
    
    console.log('Updated system setting');
    
    console.log('Content service tests completed successfully');
    return true;
  } catch (error) {
    console.error('Content service test failed:', error);
    return false;
  }
}

/**
 * Test admin service functionality
 */
async function testAdminService() {
  console.log('\n=== Testing Admin Service ===');
  
  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    // Get admin profile
    console.log('Getting admin profile...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // Not found error
      throw new Error(`Failed to get admin profile: ${profileError.message}`);
    }
    
    if (!adminProfile) {
      // Create admin profile
      console.log('Creating admin profile...');
      const newProfile = {
        user_id: authData.user.id,
        full_name: 'Admin User',
        position: 'System Administrator',
        department: 'IT',
        access_level: 'full',
        last_login: new Date().toISOString()
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('admin_profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Failed to create admin profile: ${createError.message}`);
      }
      
      console.log(`Created admin profile with ID: ${createdProfile.id}`);
    } else {
      console.log(`Found existing admin profile with ID: ${adminProfile.id}`);
      
      // Update last login
      console.log('Updating admin last login...');
      const { error: updateError } = await supabase
        .from('admin_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminProfile.id);
      
      if (updateError) {
        throw new Error(`Failed to update admin last login: ${updateError.message}`);
      }
      
      console.log('Updated admin last login');
    }
    
    // Get admin stats
    console.log('Getting admin stats...');
    
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      throw new Error(`Failed to get users count: ${usersError.message}`);
    }
    
    console.log(`Total users: ${totalUsers}`);
    
    // Get user activities
    console.log('Getting user activities...');
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_logs')
      .select('*, users!inner(email, display_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (activitiesError) {
      throw new Error(`Failed to get user activities: ${activitiesError.message}`);
    }
    
    console.log(`Retrieved ${activities?.length || 0} recent activities`);
    
    // Test role permissions
    console.log('Testing role permissions...');
    const { data: permissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role', 'ADMIN')
      .single();
    
    if (permissionsError && permissionsError.code !== 'PGRST116') { // Not found error
      throw new Error(`Failed to get role permissions: ${permissionsError.message}`);
    }
    
    if (!permissions) {
      // Create role permissions
      console.log('Creating role permissions...');
      const adminPermissions = {
        role: 'ADMIN',
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          content: { create: true, read: true, update: true, delete: true },
          donations: { create: true, read: true, update: true, delete: true },
          volunteers: { create: true, read: true, update: true, delete: true },
          settings: { create: true, read: true, update: true, delete: true }
        }
      };
      
      const { error: createPermError } = await supabase
        .from('role_permissions')
        .insert(adminPermissions);
      
      if (createPermError) {
        throw new Error(`Failed to create role permissions: ${createPermError.message}`);
      }
      
      console.log('Created role permissions for ADMIN');
    } else {
      console.log('Found existing role permissions for ADMIN');
    }
    
    console.log('Admin service tests completed successfully');
    return true;
  } catch (error) {
    console.error('Admin service test failed:', error);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting Supabase services tests...');
  
  const results = {
    users: false,
    donors: false,
    volunteers: false,
    content: false,
    admin: false
  };
  
  // Run tests based on configuration
  if (config.tests.users) {
    results.users = await testUserService();
  }
  
  if (config.tests.donors) {
    results.donors = await testDonorService();
  }
  
  if (config.tests.volunteers) {
    results.volunteers = await testVolunteerService();
  }
  
  if (config.tests.content) {
    results.content = await testContentService();
  }
  
  if (config.tests.admin) {
    results.admin = await testAdminService();
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run tests
runTests().catch(console.error);
