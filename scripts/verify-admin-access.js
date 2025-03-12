// This script verifies admin access in Firebase
// Run with: node scripts/verify-admin-access.js

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

// Admin email to verify
const adminEmail = 'admin@hopecaretz.org';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Function to verify admin access
async function verifyAdminAccess(email) {
  try {
    console.log(`${colors.cyan}Verifying admin access for: ${colors.yellow}${email}${colors.reset}`);
    
    // Step 1: Check if user exists in Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    console.log(`\n${colors.green}✓ User exists in Firebase Authentication${colors.reset}`);
    console.log(`  UID: ${userRecord.uid}`);
    console.log(`  Email: ${userRecord.email}`);
    console.log(`  Display Name: ${userRecord.displayName}`);
    console.log(`  Email Verified: ${userRecord.emailVerified}`);
    
    // Step 2: Check custom claims
    const customClaims = userRecord.customClaims || {};
    console.log(`\n${colors.cyan}Custom Claims:${colors.reset}`);
    
    if (Object.keys(customClaims).length === 0) {
      console.log(`${colors.red}✗ No custom claims found${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Custom claims found${colors.reset}`);
      console.log('  Role:', customClaims.role || 'Not set');
      console.log('  SubRole:', customClaims.subRole || 'Not set');
      console.log('  Status:', customClaims.status || 'Not set');
      console.log('  isAdmin:', customClaims.isAdmin || false);
      
      if (customClaims.role === 'ADMIN' && customClaims.isAdmin === true) {
        console.log(`${colors.green}✓ User has admin role and isAdmin flag${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ User does not have proper admin role or isAdmin flag${colors.reset}`);
      }
    }
    
    // Step 3: Check Firestore user document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log(`\n${colors.red}✗ User document not found in Firestore${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✓ User document found in Firestore${colors.reset}`);
      const userData = userDoc.data();
      console.log('  Email:', userData.email);
      console.log('  Name:', userData.name);
      console.log('  Role:', userData.role);
      console.log('  SubRole:', userData.subRole);
      console.log('  Status:', userData.status);
      console.log('  isAdmin:', userData.isAdmin);
      
      if (userData.role === 'ADMIN' && userData.isAdmin === true) {
        console.log(`${colors.green}✓ User document has admin role and isAdmin flag${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ User document does not have proper admin role or isAdmin flag${colors.reset}`);
      }
    }
    
    // Step 4: Check admin profile
    const adminProfileDoc = await db.collection('admin_profiles').doc(userRecord.uid).get();
    
    if (!adminProfileDoc.exists) {
      console.log(`\n${colors.red}✗ Admin profile not found in Firestore${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✓ Admin profile found in Firestore${colors.reset}`);
      const profileData = adminProfileDoc.data();
      console.log('  User ID:', profileData.user_id);
      console.log('  Phone:', profileData.phone);
      console.log('  Address:', profileData.address);
      console.log('  City:', profileData.city);
      console.log('  Country:', profileData.country);
      
      if (profileData.permissions && profileData.permissions.length > 0) {
        console.log(`${colors.green}✓ Admin permissions found:${colors.reset}`);
        profileData.permissions.forEach(permission => {
          console.log(`  - ${permission}`);
        });
      } else {
        console.log(`${colors.yellow}⚠ No admin permissions found${colors.reset}`);
      }
    }
    
    // Step 5: Summary
    console.log(`\n${colors.cyan}${colors.bright}=== Admin Access Verification Summary ===${colors.reset}`);
    
    const hasAuthRecord = !!userRecord;
    const hasAdminClaims = customClaims.role === 'ADMIN' && customClaims.isAdmin === true;
    const hasUserDoc = userDoc.exists && userDoc.data().role === 'ADMIN' && userDoc.data().isAdmin === true;
    const hasAdminProfile = adminProfileDoc.exists;
    
    if (hasAuthRecord && hasAdminClaims && hasUserDoc && hasAdminProfile) {
      console.log(`${colors.green}${colors.bright}✓ Admin user is properly configured${colors.reset}`);
      console.log(`${colors.green}✓ User can access admin features${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}✗ Admin user is not properly configured${colors.reset}`);
      
      if (!hasAuthRecord) console.log(`${colors.red}✗ User does not exist in Firebase Authentication${colors.reset}`);
      if (!hasAdminClaims) console.log(`${colors.red}✗ User does not have proper admin claims${colors.reset}`);
      if (!hasUserDoc) console.log(`${colors.red}✗ User document is missing or does not have admin role${colors.reset}`);
      if (!hasAdminProfile) console.log(`${colors.red}✗ Admin profile is missing${colors.reset}`);
    }
    
    return hasAuthRecord && hasAdminClaims && hasUserDoc && hasAdminProfile;
  } catch (error) {
    console.error(`${colors.red}Error verifying admin access:${colors.reset}`, error);
    return false;
  }
}

// Run the script
verifyAdminAccess(adminEmail)
  .then((isValid) => {
    if (isValid) {
      console.log(`\n${colors.green}${colors.bright}Admin verification completed successfully.${colors.reset}`);
      console.log(`${colors.cyan}You can now log in with:${colors.reset}`);
      console.log(`${colors.yellow}Email: ${adminEmail}${colors.reset}`);
      console.log(`${colors.yellow}Password: Hope@admin2${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bright}Admin verification failed.${colors.reset}`);
      console.log(`${colors.yellow}Please run the create:admin script first:${colors.reset}`);
      console.log(`${colors.cyan}npm run create:admin${colors.reset}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Script failed:${colors.reset}`, error);
    process.exit(1);
  }); 