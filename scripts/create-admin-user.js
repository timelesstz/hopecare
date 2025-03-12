// This script creates an admin user in Firebase
// Run with: node scripts/create-admin-user.js

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

// Admin user data
const adminUser = {
  email: 'admin@hopecaretz.org',
  password: 'Hope@admin2',
  displayName: 'HopeCare Admin',
  role: 'ADMIN',
  subRole: 'System Administrator',
  profile: {
    phone: '+255123456789',
    address: '123 Admin Street',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    permissions: [
      'manage_users',
      'manage_content',
      'manage_donations',
      'manage_volunteers',
      'manage_projects',
      'system_settings'
    ]
  }
};

// Create admin user in Firebase Authentication and Firestore
async function createAdminUser(userData) {
  try {
    console.log(`Creating admin user: ${userData.email}`);
    
    // Check if user already exists
    try {
      const userRecord = await auth.getUserByEmail(userData.email);
      console.log(`User ${userData.email} already exists with UID: ${userRecord.uid}`);
      
      // Update custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE',
        isAdmin: true
      });
      console.log(`Updated custom claims for ${userData.email}`);
      
      // Update user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE',
        isAdmin: true,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Updated Firestore document for ${userData.email}`);
      
      // Create or update admin profile
      await db.collection('admin_profiles').doc(userRecord.uid).set({
        ...userData.profile,
        user_id: userRecord.uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Updated admin profile for ${userData.email}`);
      
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
        status: 'ACTIVE',
        isAdmin: true
      });
      console.log(`Set custom claims for ${userData.email}`);
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        subRole: userData.subRole,
        status: 'ACTIVE',
        isAdmin: true,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      });
      
      console.log(`Created Firestore document for ${userData.email}`);
      
      // Create admin profile
      await db.collection('admin_profiles').doc(userRecord.uid).set({
        ...userData.profile,
        user_id: userRecord.uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      });
      console.log(`Created admin profile for ${userData.email}`);
      
      return userRecord.uid;
    }
  } catch (error) {
    console.error(`Error creating admin user ${userData.email}:`, error);
    return null;
  }
}

// Run the script
createAdminUser(adminUser)
  .then((uid) => {
    if (uid) {
      console.log(`\nAdmin user created successfully with UID: ${uid}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`\nYou can now log in with these credentials to access admin features.`);
    } else {
      console.error('Failed to create admin user.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 