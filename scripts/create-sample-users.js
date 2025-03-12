// This script creates sample volunteer and donor accounts in Firebase
// Run with: node scripts/create-sample-users.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Sample volunteer accounts
const volunteerAccounts = [
  {
    email: 'emma.parker@example.com',
    password: 'Volunteer2024!',
    displayName: 'Emma Parker',
    role: 'VOLUNTEER',
    subRole: 'Program Lead',
    profile: {
      phone: '+1234567890',
      address: '123 Volunteer St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001',
      skills: ['leadership', 'program management', 'teaching'],
      availability: {
        weekdays: true,
        weekends: true,
        hours_per_week: 15
      },
      experience: '5 years in community service',
      emergency_contact: {
        name: 'James Parker',
        relationship: 'Spouse',
        phone: '+1234567891'
      }
    }
  },
  {
    email: 'michael.chen@example.com',
    password: 'Community2024@',
    displayName: 'Michael Chen',
    role: 'VOLUNTEER',
    subRole: 'Event Volunteer',
    profile: {
      phone: '+1234567892',
      address: '456 Community Ave',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postal_code: '94105',
      skills: ['event planning', 'photography', 'social media'],
      availability: {
        weekdays: false,
        weekends: true,
        hours_per_week: 8
      },
      experience: '2 years volunteering at local events',
      emergency_contact: {
        name: 'Lisa Chen',
        relationship: 'Sister',
        phone: '+1234567893'
      }
    }
  },
  {
    email: 'sofia.rodriguez@example.com',
    password: 'Helping2024#',
    displayName: 'Sofia Rodriguez',
    role: 'VOLUNTEER',
    subRole: 'Coordinator',
    profile: {
      phone: '+1234567894',
      address: '789 Helper Blvd',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      postal_code: '33101',
      skills: ['coordination', 'bilingual (Spanish)', 'recruitment'],
      availability: {
        weekdays: true,
        weekends: false,
        hours_per_week: 20
      },
      experience: '7 years in volunteer coordination',
      emergency_contact: {
        name: 'Carlos Rodriguez',
        relationship: 'Father',
        phone: '+1234567895'
      }
    }
  }
];

// Sample donor accounts
const donorAccounts = [
  {
    email: 'john.doe@example.com',
    password: 'Donor2024!',
    displayName: 'John Doe',
    role: 'DONOR',
    subRole: 'Regular Donor',
    profile: {
      phone: '+1234567896',
      address: '101 Giving Lane',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      postal_code: '60601',
      donation_preferences: {
        frequency: 'quarterly',
        causes: ['education', 'health'],
        communication: 'email'
      },
      donation_history: [
        {
          amount: 100,
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          project: 'Education for All'
        },
        {
          amount: 150,
          date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          project: 'Healthcare Initiative'
        }
      ]
    }
  },
  {
    email: 'sarah.smith@example.com',
    password: 'Giving2024@',
    displayName: 'Sarah Smith',
    role: 'DONOR',
    subRole: 'Monthly Donor',
    profile: {
      phone: '+1234567897',
      address: '202 Support Street',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      postal_code: '02108',
      donation_preferences: {
        frequency: 'monthly',
        causes: ['children', 'environment'],
        communication: 'sms'
      },
      donation_history: [
        {
          amount: 50,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          project: 'Children Support Program'
        },
        {
          amount: 50,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          project: 'Children Support Program'
        }
      ]
    }
  },
  {
    email: 'david.wilson@example.com',
    password: 'Support2024#',
    displayName: 'David Wilson',
    role: 'DONOR',
    subRole: 'Corporate Donor',
    profile: {
      phone: '+1234567898',
      address: '303 Corporate Plaza',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      postal_code: '98101',
      company: 'Wilson Enterprises',
      donation_preferences: {
        frequency: 'annual',
        causes: ['education', 'poverty'],
        communication: 'email'
      },
      donation_history: [
        {
          amount: 5000,
          date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          project: 'Education for All'
        }
      ]
    }
  }
];

// Create a user in Firebase Authentication and Firestore
async function createUser(userData) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Check if user already exists
    try {
      const userRecord = await auth.getUserByEmail(userData.email);
      console.log(`User ${userData.email} already exists with UID: ${userRecord.uid}`);
      
      // Update custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE'
      });
      console.log(`Updated custom claims for ${userData.email}`);
      
      // Update user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Updated Firestore document for ${userData.email}`);
      
      // Create or update profile
      if (userData.role === 'VOLUNTEER') {
        await db.collection('volunteer_profiles').doc(userRecord.uid).set({
          ...userData.profile,
          user_id: userRecord.uid,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Updated volunteer profile for ${userData.email}`);
      } else if (userData.role === 'DONOR') {
        await db.collection('donor_profiles').doc(userRecord.uid).set({
          ...userData.profile,
          user_id: userRecord.uid,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Updated donor profile for ${userData.email}`);
        
        // Create donation records
        if (userData.profile.donation_history) {
          for (const donation of userData.profile.donation_history) {
            await db.collection('donations').add({
              user_id: userRecord.uid,
              amount: donation.amount,
              currency: 'USD',
              status: 'completed',
              payment_method: 'card',
              project_id: donation.project,
              type: userData.profile.donation_preferences.frequency === 'monthly' ? 'monthly' : 'one-time',
              created_at: new Date(donation.date),
              updated_at: FieldValue.serverTimestamp()
            });
          }
          console.log(`Created ${userData.profile.donation_history.length} donation records for ${userData.email}`);
        }
      }
      
      return userRecord.uid;
    } catch (error) {
      // User doesn't exist, create new user
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true
      });
      
      console.log(`Created Firebase Auth user: ${userRecord.uid}`);
      
      // Set custom claims for role-based access
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE'
      });
      console.log(`Set custom claims for ${userData.email}`);
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      });
      
      console.log(`Created Firestore document for ${userData.email}`);
      
      // Create profile
      if (userData.role === 'VOLUNTEER') {
        await db.collection('volunteer_profiles').doc(userRecord.uid).set({
          ...userData.profile,
          user_id: userRecord.uid,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
        console.log(`Created volunteer profile for ${userData.email}`);
      } else if (userData.role === 'DONOR') {
        await db.collection('donor_profiles').doc(userRecord.uid).set({
          ...userData.profile,
          user_id: userRecord.uid,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
        console.log(`Created donor profile for ${userData.email}`);
        
        // Create donation records
        if (userData.profile.donation_history) {
          for (const donation of userData.profile.donation_history) {
            await db.collection('donations').add({
              user_id: userRecord.uid,
              amount: donation.amount,
              currency: 'USD',
              status: 'completed',
              payment_method: 'card',
              project_id: donation.project,
              type: userData.profile.donation_preferences.frequency === 'monthly' ? 'monthly' : 'one-time',
              created_at: new Date(donation.date),
              updated_at: FieldValue.serverTimestamp()
            });
          }
          console.log(`Created ${userData.profile.donation_history.length} donation records for ${userData.email}`);
        }
      }
      
      return userRecord.uid;
    }
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error);
    return null;
  }
}

async function createSampleUsers() {
  console.log('Creating sample volunteer accounts...');
  for (const volunteerData of volunteerAccounts) {
    await createUser(volunteerData);
  }
  
  console.log('\nCreating sample donor accounts...');
  for (const donorData of donorAccounts) {
    await createUser(donorData);
  }
  
  console.log('\nSample users created successfully!');
}

// Run the script
createSampleUsers()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 