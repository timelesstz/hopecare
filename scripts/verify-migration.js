// This script verifies the migration by checking the data in Firestore
// Run with: node scripts/verify-migration.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
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

async function verifyMigration() {
  console.log(`${colors.cyan}Verifying migration...${colors.reset}`);
  
  // Verify users
  console.log(`\n${colors.yellow}Verifying users...${colors.reset}`);
  try {
    const listUsersResult = await auth.listUsers();
    console.log(`${colors.green}✓ Found ${listUsersResult.users.length} users in Firebase Authentication${colors.reset}`);
    
    // List users
    listUsersResult.users.forEach(user => {
      console.log(`${colors.blue}- ${user.email} (${user.uid})${colors.reset}`);
      if (user.customClaims) {
        console.log(`  ${colors.blue}Role: ${user.customClaims.role}${colors.reset}`);
        console.log(`  ${colors.blue}Status: ${user.customClaims.status}${colors.reset}`);
      }
    });
  } catch (error) {
    console.error(`${colors.red}✗ Error verifying users:${colors.reset}`, error.message);
  }
  
  // Verify Firestore collections
  const collections = [
    'users',
    'donor_profiles',
    'volunteer_profiles',
    'donations',
    'projects'
  ];
  
  for (const collectionName of collections) {
    console.log(`\n${colors.yellow}Verifying ${collectionName}...${colors.reset}`);
    try {
      const snapshot = await db.collection(collectionName).get();
      console.log(`${colors.green}✓ Found ${snapshot.size} documents in ${collectionName}${colors.reset}`);
      
      // List documents
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`${colors.blue}- ${doc.id}${colors.reset}`);
        
        // Print some key fields based on collection type
        if (collectionName === 'users') {
          console.log(`  ${colors.blue}Email: ${data.email}${colors.reset}`);
          console.log(`  ${colors.blue}Role: ${data.role}${colors.reset}`);
        } else if (collectionName === 'donor_profiles' || collectionName === 'volunteer_profiles') {
          console.log(`  ${colors.blue}User ID: ${data.user_id}${colors.reset}`);
        } else if (collectionName === 'donations') {
          console.log(`  ${colors.blue}Amount: ${data.amount} ${data.currency}${colors.reset}`);
          console.log(`  ${colors.blue}Status: ${data.status}${colors.reset}`);
        } else if (collectionName === 'projects') {
          console.log(`  ${colors.blue}Title: ${data.title}${colors.reset}`);
          console.log(`  ${colors.blue}Goal: ${data.goal_amount}${colors.reset}`);
        }
      });
    } catch (error) {
      console.error(`${colors.red}✗ Error verifying ${collectionName}:${colors.reset}`, error.message);
    }
  }
  
  console.log(`\n${colors.cyan}Migration verification completed.${colors.reset}`);
}

// Run the verification
verifyMigration()
  .then(() => {
    console.log(`${colors.green}Verification completed successfully${colors.reset}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Verification failed:${colors.reset}`, error);
    process.exit(1);
  }); 