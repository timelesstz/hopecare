// This script helps migrate users from Supabase to Firebase
// Run with: node scripts/migrate-to-firebase.js

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';
import loadServiceAccount from './utils/service-account.js';

// Load environment variables
config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Load the Firebase service account
const serviceAccount = loadServiceAccount();

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

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
            created_at: user.created_at || FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
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
          created_at: user.created_at || FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
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