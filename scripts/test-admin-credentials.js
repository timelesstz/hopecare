// This script tests admin login credentials directly with Firebase
// Run with: node scripts/test-admin-credentials.js

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Load environment variables
config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Admin credentials
const adminEmail = 'admin@hopecaretz.org';
const adminPassword = 'Hope@admin2';

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

async function testAdminCredentials() {
  console.log(`${colors.cyan}Testing admin credentials...${colors.reset}`);
  console.log(`${colors.cyan}Email: ${colors.yellow}${adminEmail}${colors.reset}`);
  console.log(`${colors.cyan}Password: ${colors.yellow}${adminPassword}${colors.reset}`);
  console.log(`${colors.cyan}Firebase Project: ${colors.yellow}${firebaseConfig.projectId}${colors.reset}`);
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  try {
    console.log(`\n${colors.cyan}Attempting to sign in...${colors.reset}`);
    
    // Sign in with admin credentials
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log(`${colors.green}✓ Login successful${colors.reset}`);
    console.log(`  UID: ${user.uid}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Display Name: ${user.displayName || 'Not set'}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    
    // Get ID token and check custom claims
    console.log(`\n${colors.cyan}Checking custom claims...${colors.reset}`);
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims;
    
    console.log(`${colors.green}✓ Token claims retrieved${colors.reset}`);
    console.log('  Role:', claims.role || 'Not set');
    console.log('  SubRole:', claims.subRole || 'Not set');
    console.log('  Status:', claims.status || 'Not set');
    console.log('  isAdmin:', claims.isAdmin || false);
    
    // Get user document from Firestore
    console.log(`\n${colors.cyan}Fetching user data from Firestore...${colors.reset}`);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log(`${colors.red}✗ User document not found in Firestore${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ User document found in Firestore${colors.reset}`);
      const userData = userDoc.data();
      console.log('  Email:', userData.email);
      console.log('  Name:', userData.name);
      console.log('  Role:', userData.role);
      console.log('  SubRole:', userData.subRole);
      console.log('  Status:', userData.status);
      console.log('  isAdmin:', userData.isAdmin);
    }
    
    // Sign out
    await signOut(auth);
    console.log(`\n${colors.green}✓ Successfully signed out${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`\n${colors.red}Error testing admin credentials:${colors.reset}`, error);
    console.log(`\n${colors.red}Error code:${colors.reset}`, error.code);
    console.log(`${colors.red}Error message:${colors.reset}`, error.message);
    
    // Provide troubleshooting guidance based on error code
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
      console.log(`1. Double-check the email and password`);
      console.log(`2. Ensure the user exists in Firebase Authentication`);
      console.log(`3. Try resetting the password using the Firebase console`);
    } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/operation-not-allowed') {
      console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
      console.log(`1. Check your Firebase configuration in .env file`);
      console.log(`2. Ensure email/password authentication is enabled in Firebase console`);
      console.log(`3. Verify your Firebase project is properly set up`);
    }
    
    return false;
  }
}

// Run the test
testAdminCredentials()
  .then((success) => {
    if (success) {
      console.log(`\n${colors.green}${colors.bright}Admin credentials test passed!${colors.reset}`);
      console.log(`${colors.green}You should be able to log in to the application.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bright}Admin credentials test failed.${colors.reset}`);
      console.log(`${colors.yellow}Please check the error messages above for troubleshooting.${colors.reset}`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
  }); 