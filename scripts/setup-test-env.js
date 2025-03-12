// This script sets up the environment for testing the migration
// It creates mock data in Firebase for testing

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

// Firebase configuration
const firebaseServiceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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

// Mock users for testing
const mockUsers = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: 'Password123!'
  },
  {
    email: 'donor@example.com',
    name: 'Donor User',
    role: 'DONOR',
    status: 'ACTIVE',
    password: 'Password123!'
  },
  {
    email: 'volunteer@example.com',
    name: 'Volunteer User',
    role: 'VOLUNTEER',
    status: 'ACTIVE',
    password: 'Password123!'
  }
];

// Mock donor profiles
const mockDonorProfiles = [
  {
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

// Mock donations
const mockDonations = [
  {
    amount: 100,
    currency: 'USD',
    status: 'completed',
    payment_method: 'card',
    project_id: 'project-1',
    type: 'one-time'
  },
  {
    amount: 50,
    currency: 'USD',
    status: 'completed',
    payment_method: 'card',
    project_id: 'project-2',
    type: 'monthly'
  }
];

async function setupTestEnvironment() {
  try {
    console.log('Setting up test environment...');
    
    // Create users
    for (const user of mockUsers) {
      try {
        // Check if user already exists
        try {
          await auth.getUserByEmail(user.email);
          console.log(`User ${user.email} already exists`);
          continue;
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
        }
        
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email: user.email,
          displayName: user.name,
          password: user.password,
          emailVerified: true
        });
        
        console.log(`Created user: ${userRecord.uid}`);
        
        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          role: user.role,
          status: user.status
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
        
        // Create profile based on role
        if (user.role === 'DONOR') {
          const donorProfile = mockDonorProfiles[0];
          await db.collection('donor_profiles').doc(userRecord.uid).set({
            ...donorProfile,
            user_id: userRecord.uid,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
          });
          
          // Create donations for donor
          for (const donation of mockDonations) {
            await db.collection('donations').add({
              ...donation,
              user_id: userRecord.uid,
              created_at: FieldValue.serverTimestamp(),
              updated_at: FieldValue.serverTimestamp()
            });
          }
        } else if (user.role === 'VOLUNTEER') {
          const volunteerProfile = mockVolunteerProfiles[0];
          await db.collection('volunteer_profiles').doc(userRecord.uid).set({
            ...volunteerProfile,
            user_id: userRecord.uid,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
          });
        }
        
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    console.log('Test environment setup completed!');
    
  } catch (error) {
    console.error('Error setting up test environment:', error);
  }
}

// Run the setup
setupTestEnvironment()
  .then(() => {
    console.log('Setup script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup script failed:', error);
    process.exit(1);
  }); 