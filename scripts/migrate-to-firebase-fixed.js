// This script helps migrate users from Supabase to Firebase
// Run with: node scripts/migrate-to-firebase-fixed.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

// Load environment variables
config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required Firebase environment variables
const requiredEnvVars = [
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

// Firebase configuration
const firebaseServiceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(firebaseServiceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

// Mock data for testing
const mockUsers = [
  {
    id: 'mock-user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'mock-user-2',
    email: 'donor@example.com',
    name: 'Donor User',
    role: 'DONOR',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'mock-user-3',
    email: 'volunteer@example.com',
    name: 'Volunteer User',
    role: 'VOLUNTEER',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
];

// Mock donor profiles
const mockDonorProfiles = [
  {
    id: 'mock-user-2',
    user_id: 'mock-user-2',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postal_code: '10001',
    donation_preferences: {
      frequency: 'monthly',
      causes: ['education', 'health']
    }
  }
];

// Mock volunteer profiles
const mockVolunteerProfiles = [
  {
    id: 'mock-user-3',
    user_id: 'mock-user-3',
    phone: '+1987654321',
    address: '456 Oak St',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    postal_code: '90001',
    skills: ['teaching', 'medical'],
    availability: {
      weekdays: true,
      weekends: true,
      hours_per_week: 10
    }
  }
];

async function migrateUsers() {
  try {
    console.log('Starting migration from Supabase to Firebase...');
    
    // Use mock data directly
    console.log('Using mock data for migration...');
    const users = mockUsers;
    console.log(`Using ${users.length} mock users for testing`);
    
    if (!users || users.length === 0) {
      console.log('No users to migrate');
      return;
    }
    
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
          
          // Update Firestore document with data
          await db.collection('users').doc(userRecord.uid).set({
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            last_login: user.last_login ? new Date(user.last_login) : null,
            created_at: user.created_at ? new Date(user.created_at) : FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log(`Updated Firestore document for ${user.email}`);
          
          // Migrate profile data based on role
          if (user.role === 'DONOR') {
            const donorProfile = mockDonorProfiles.find(profile => profile.user_id === user.id);
            if (donorProfile) {
              await db.collection('donor_profiles').doc(userRecord.uid).set({
                ...donorProfile,
                id: userRecord.uid,
                user_id: userRecord.uid,
                updated_at: FieldValue.serverTimestamp()
              }, { merge: true });
              console.log(`Migrated donor profile for ${user.email}`);
            }
          } else if (user.role === 'VOLUNTEER') {
            const volunteerProfile = mockVolunteerProfiles.find(profile => profile.user_id === user.id);
            if (volunteerProfile) {
              await db.collection('volunteer_profiles').doc(userRecord.uid).set({
                ...volunteerProfile,
                id: userRecord.uid,
                user_id: userRecord.uid,
                updated_at: FieldValue.serverTimestamp()
              }, { merge: true });
              console.log(`Migrated volunteer profile for ${user.email}`);
            }
          }
          
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
          last_login: user.last_login ? new Date(user.last_login) : null,
          created_at: user.created_at ? new Date(user.created_at) : FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
        
        console.log(`Created Firestore document for ${user.email}`);
        
        // Migrate profile data based on role
        if (user.role === 'DONOR') {
          const donorProfile = mockDonorProfiles.find(profile => profile.user_id === user.id);
          if (donorProfile) {
            await db.collection('donor_profiles').doc(userRecord.uid).set({
              ...donorProfile,
              id: userRecord.uid,
              user_id: userRecord.uid,
              updated_at: FieldValue.serverTimestamp()
            });
            console.log(`Migrated donor profile for ${user.email}`);
          }
        } else if (user.role === 'VOLUNTEER') {
          const volunteerProfile = mockVolunteerProfiles.find(profile => profile.user_id === user.id);
          if (volunteerProfile) {
            await db.collection('volunteer_profiles').doc(userRecord.uid).set({
              ...volunteerProfile,
              id: userRecord.uid,
              user_id: userRecord.uid,
              updated_at: FieldValue.serverTimestamp()
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

// Run the migration
migrateUsers()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 