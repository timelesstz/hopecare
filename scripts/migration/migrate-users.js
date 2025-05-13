// Script to migrate users from Firebase to Supabase
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: new URL('../../../.env', import.meta.url).pathname });

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://tkxppievtqiipcsdqbpf.supabase.co`;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Service key available:', !!supabaseServiceKey);

// Initialize Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  console.log('Checking for service-account.json file...');
  
  // Try to load from service-account.json if environment variable is not available
  try {
    const serviceAccountPath = path.join(__dirname, '../../../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log('Firebase Admin SDK initialized from service-account.json');
    } else {
      console.error('service-account.json file not found');
      process.exit(1);
    }
  } catch (fileError) {
    console.error('Error loading service-account.json:', fileError.message);
    process.exit(1);
  }
}

// Function to migrate a single user
async function migrateUser(firebaseUser) {
  try {
    console.log(`Migrating user: ${firebaseUser.email}`);
    
    // Check if user already exists in Supabase
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing Supabase users:', listError.message);
      return false;
    }
    
    const existingUser = users.find(user => user.email === firebaseUser.email);
    
    if (existingUser) {
      console.log(`User ${firebaseUser.email} already exists in Supabase with ID: ${existingUser.id}`);
      return true;
    }
    
    // Create user in Supabase Auth
    // Note: We can't migrate passwords directly, so users will need to reset their passwords
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: firebaseUser.email,
      email_confirm: true,
      user_metadata: {
        name: firebaseUser.displayName || '',
        role: firebaseUser.customClaims?.role || 'user',
        firebase_uid: firebaseUser.uid
      }
    });
    
    if (createError) {
      console.error(`Error creating user ${firebaseUser.email} in Supabase:`, createError.message);
      return false;
    }
    
    console.log(`Created user ${firebaseUser.email} in Supabase with ID: ${authUser.user.id}`);
    
    // Get user role from Firebase custom claims
    const role = firebaseUser.customClaims?.role || 'user';
    
    // Create user record in public.users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || '',
        role: role,
        created_at: new Date(firebaseUser.metadata.creationTime).toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error(`Error creating user record for ${firebaseUser.email}:`, insertError.message);
      return false;
    }
    
    // Create role-specific profile if needed
    if (role === 'donor') {
      // Get donor profile data from Firebase
      const donorSnapshot = await admin.firestore().collection('donor_profiles').doc(firebaseUser.uid).get();
      const donorData = donorSnapshot.exists ? donorSnapshot.data() : {};
      
      // Create donor profile in Supabase
      const { error: donorError } = await supabase
        .from('donor_profiles')
        .insert({
          id: authUser.user.id,
          full_name: donorData.full_name || firebaseUser.displayName || '',
          phone: donorData.phone || '',
          address: donorData.address || '',
          donation_preference: donorData.donation_preference || 'one-time',
          total_donated: donorData.total_donated || 0,
          last_donation_date: donorData.last_donation_date || null,
          created_at: new Date(firebaseUser.metadata.creationTime).toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (donorError) {
        console.error(`Error creating donor profile for ${firebaseUser.email}:`, donorError.message);
      }
    } else if (role === 'volunteer') {
      // Get volunteer profile data from Firebase
      const volunteerSnapshot = await admin.firestore().collection('volunteer_profiles').doc(firebaseUser.uid).get();
      const volunteerData = volunteerSnapshot.exists ? volunteerSnapshot.data() : {};
      
      // Create volunteer profile in Supabase
      const { error: volunteerError } = await supabase
        .from('volunteer_profiles')
        .insert({
          id: authUser.user.id,
          full_name: volunteerData.full_name || firebaseUser.displayName || '',
          phone: volunteerData.phone || '',
          address: volunteerData.address || '',
          skills: volunteerData.skills || [],
          availability: volunteerData.availability || [],
          hours_contributed: volunteerData.hours_contributed || 0,
          created_at: new Date(firebaseUser.metadata.creationTime).toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (volunteerError) {
        console.error(`Error creating volunteer profile for ${firebaseUser.email}:`, volunteerError.message);
      }
    } else if (role === 'admin') {
      // Get admin profile data from Firebase
      const adminSnapshot = await admin.firestore().collection('admin_profiles').doc(firebaseUser.uid).get();
      const adminData = adminSnapshot.exists ? adminSnapshot.data() : {};
      
      // Create admin profile in Supabase
      const { error: adminError } = await supabase
        .from('admin_profiles')
        .insert({
          id: authUser.user.id,
          full_name: adminData.full_name || firebaseUser.displayName || '',
          position: adminData.position || 'Staff',
          department: adminData.department || 'General',
          access_level: adminData.access_level || 'standard',
          last_login: new Date().toISOString(),
          created_at: new Date(firebaseUser.metadata.creationTime).toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (adminError) {
        console.error(`Error creating admin profile for ${firebaseUser.email}:`, adminError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error migrating user ${firebaseUser.email}:`, error.message);
    return false;
  }
}

// Main migration function
async function migrateUsers() {
  try {
    console.log('Starting user migration from Firebase to Supabase...');
    
    // Get all users from Firebase
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;
    
    console.log(`Found ${firebaseUsers.length} users in Firebase`);
    
    // Track migration statistics
    let successCount = 0;
    let failureCount = 0;
    
    // Migrate each user
    for (const firebaseUser of firebaseUsers) {
      const success = await migrateUser(firebaseUser);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    console.log('\nUser migration completed:');
    console.log(`- Total users: ${firebaseUsers.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${failureCount}`);
    
    if (failureCount > 0) {
      console.log('\nSome users failed to migrate. Check the logs for details.');
    } else {
      console.log('\nAll users successfully migrated!');
    }
    
  } catch (error) {
    console.error('Error during user migration:', error.message);
    process.exit(1);
  }
}

// Execute the migration
migrateUsers()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  });
