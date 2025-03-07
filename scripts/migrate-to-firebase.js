// This script helps migrate users from Supabase to Firebase
// Run with: node scripts/migrate-to-firebase.js

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_SERVICE_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Format Firebase private key correctly
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedPrivateKey = privateKey.startsWith('"') 
  ? JSON.parse(privateKey) 
  : privateKey.replace(/\\n/g, '\n');

// Firebase configuration
const firebaseServiceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": formattedPrivateKey,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Supabase
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  process.exit(1);
}

// Initialize Firebase
let auth, db;
try {
  initializeApp({
    credential: cert(firebaseServiceAccount)
  });
  
  auth = getAuth();
  db = getFirestore();
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

async function migrateUsers() {
  try {
    console.log('Starting migration from Supabase to Firebase...');
    
    // 1. Get all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return;
    }
    
    console.log(`Found ${users.length} users to migrate`);
    
    // 2. Migrate each user
    for (const user of users) {
      try {
        console.log(`Migrating user: ${user.email}`);
        
        // Check if user already exists in Firebase
        try {
          const userRecord = await auth.getUserByEmail(user.email);
          console.log(`User ${user.email} already exists in Firebase with UID: ${userRecord.uid}`);
          
          // Set custom claims for role-based access
          await auth.setCustomUserClaims(userRecord.uid, {
            role: user.role,
            status: user.status
          });
          console.log(`Updated custom claims for ${user.email}`);
          
          // Update Firestore document with Supabase data
          await db.collection('users').doc(userRecord.uid).set({
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            last_login: user.last_login,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { merge: true });
          
          console.log(`Updated Firestore document for ${user.email}`);
          continue;
        } catch (error) {
          // User doesn't exist, create new user
          if (error.code === 'auth/user-not-found') {
            console.log(`Creating new user in Firebase: ${user.email}`);
          } else {
            throw error;
          }
        }
        
        // Create user in Firebase Auth
        // Note: This requires a password, which we don't have from Supabase
        // You'll need to either:
        // 1. Set a temporary password and force reset
        // 2. Use a password reset email flow
        // 3. Import with a password hash if you have access to it
        const userRecord = await auth.createUser({
          email: user.email,
          displayName: user.name,
          // Using a temporary password - users will need to reset
          password: 'TemporaryPassword123!',
          emailVerified: user.status === 'ACTIVE'
        });
        
        console.log(`Created Firebase Auth user: ${userRecord.uid}`);
        
        // Set custom claims for role-based access
        await auth.setCustomUserClaims(userRecord.uid, {
          role: user.role,
          status: user.status
        });
        console.log(`Set custom claims for ${user.email}`);
        
        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          last_login: user.last_login,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        console.log(`Created Firestore document for ${user.email}`);
        
        // Migrate additional profile data if needed
        if (user.role === 'DONOR') {
          const { data: donorProfile, error: donorError } = await supabase
            .from('donor_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!donorError && donorProfile) {
            await db.collection('donor_profiles').doc(userRecord.uid).set({
              ...donorProfile,
              id: userRecord.uid
            });
            console.log(`Migrated donor profile for ${user.email}`);
          }
        } else if (user.role === 'VOLUNTEER') {
          const { data: volunteerProfile, error: volunteerError } = await supabase
            .from('volunteer_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!volunteerError && volunteerProfile) {
            await db.collection('volunteer_profiles').doc(userRecord.uid).set({
              ...volunteerProfile,
              id: userRecord.uid
            });
            console.log(`Migrated volunteer profile for ${user.email}`);
          }
        }
        
      } catch (userError) {
        console.error(`Error migrating user ${user.email}:`, userError);
      }
    }
    
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateUsers(); 