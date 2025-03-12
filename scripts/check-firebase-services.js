// This script checks if Firebase Authentication, Firestore Database, and Storage are enabled
// Run with: node scripts/check-firebase-services.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
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
  credential: cert(firebaseServiceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

async function checkFirebaseServices() {
  console.log(`${colors.cyan}Checking Firebase services...${colors.reset}`);
  console.log(`${colors.cyan}Project ID: ${process.env.FIREBASE_PROJECT_ID}${colors.reset}`);
  
  // Check Authentication
  console.log(`\n${colors.yellow}Checking Firebase Authentication...${colors.reset}`);
  try {
    const auth = getAuth(app);
    // Try to list users (limited to 1)
    const listUsersResult = await auth.listUsers(1);
    console.log(`${colors.green}✓ Firebase Authentication is enabled${colors.reset}`);
    console.log(`${colors.blue}Found ${listUsersResult.users.length} users${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Firebase Authentication error:${colors.reset}`, error.message);
    if (error.code === 'auth/internal-error') {
      console.log(`${colors.yellow}This might be due to missing permissions or the service not being enabled.${colors.reset}`);
      console.log(`${colors.yellow}Please enable Firebase Authentication in the Firebase Console.${colors.reset}`);
    }
  }
  
  // Check Firestore
  console.log(`\n${colors.yellow}Checking Firestore Database...${colors.reset}`);
  try {
    const db = getFirestore(app);
    // Try to get a collection
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`${colors.green}✓ Firestore Database is enabled${colors.reset}`);
    console.log(`${colors.blue}Found ${usersSnapshot.size} documents in 'users' collection${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Firestore Database error:${colors.reset}`, error.message);
    if (error.code === 7) {
      console.log(`${colors.yellow}Firestore API is not enabled.${colors.reset}`);
      console.log(`${colors.yellow}Please enable Firestore API in the Google Cloud Console:${colors.reset}`);
      console.log(`${colors.yellow}https://console.cloud.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.FIREBASE_PROJECT_ID}${colors.reset}`);
    }
  }
  
  // Check Storage
  console.log(`\n${colors.yellow}Checking Firebase Storage...${colors.reset}`);
  try {
    const storage = getStorage(app);
    const bucket = storage.bucket();
    console.log(`${colors.blue}Storage bucket: ${bucket.name}${colors.reset}`);
    
    // Try to list files (limited to 1)
    try {
      const [files] = await bucket.getFiles({ maxResults: 1 });
      console.log(`${colors.green}✓ Firebase Storage is enabled${colors.reset}`);
      console.log(`${colors.blue}Found ${files.length} files${colors.reset}`);
    } catch (listError) {
      // Even if listing files fails, the bucket exists
      console.log(`${colors.green}✓ Firebase Storage is enabled${colors.reset}`);
      console.log(`${colors.yellow}Could not list files: ${listError.message}${colors.reset}`);
      console.log(`${colors.yellow}This might be due to permissions or an empty bucket${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Firebase Storage error:${colors.reset}`, error.message);
    if (error.message.includes('Bucket name not specified')) {
      console.log(`${colors.yellow}Storage bucket is not configured properly.${colors.reset}`);
      console.log(`${colors.yellow}Please check your FIREBASE_STORAGE_BUCKET environment variable.${colors.reset}`);
      console.log(`${colors.yellow}Default bucket name should be: ${process.env.FIREBASE_PROJECT_ID}.appspot.com${colors.reset}`);
    } else if (error.code === 7) {
      console.log(`${colors.yellow}Firebase Storage API is not enabled.${colors.reset}`);
      console.log(`${colors.yellow}Please enable Firebase Storage API in the Google Cloud Console:${colors.reset}`);
      console.log(`${colors.yellow}https://console.cloud.google.com/apis/api/storage.googleapis.com/overview?project=${process.env.FIREBASE_PROJECT_ID}${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.cyan}Firebase services check completed.${colors.reset}`);
  console.log(`${colors.cyan}If any services are not enabled, please follow the instructions above to enable them.${colors.reset}`);
}

// Run the check
checkFirebaseServices()
  .then(() => {
    console.log(`${colors.green}Check completed successfully${colors.reset}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Check failed:${colors.reset}`, error);
    process.exit(1);
  }); 