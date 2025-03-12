// This script tests admin login with Firebase
// Run with: node scripts/test-admin-login.js

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Load environment variables
config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// Function to test admin login
async function testAdminLogin() {
  try {
    console.log(`${colors.cyan}Testing admin login for: ${colors.yellow}${adminEmail}${colors.reset}`);
    console.log(`${colors.cyan}Using Firebase project: ${colors.yellow}${firebaseConfig.projectId}${colors.reset}`);
    
    // Step 1: Sign in with admin credentials
    console.log(`\n${colors.cyan}Attempting to sign in...${colors.reset}`);
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log(`${colors.green}✓ Login successful${colors.reset}`);
    console.log(`  UID: ${user.uid}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Display Name: ${user.displayName || 'Not set'}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    
    // Step 2: Get ID token and check custom claims
    console.log(`\n${colors.cyan}Checking custom claims...${colors.reset}`);
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims;
    
    console.log(`${colors.green}✓ Token claims retrieved${colors.reset}`);
    console.log('  Role:', claims.role || 'Not set');
    console.log('  SubRole:', claims.subRole || 'Not set');
    console.log('  Status:', claims.status || 'Not set');
    console.log('  isAdmin:', claims.isAdmin || false);
    
    if (claims.role === 'ADMIN' && claims.isAdmin === true) {
      console.log(`${colors.green}✓ User has admin role and isAdmin flag${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ User does not have proper admin role or isAdmin flag${colors.reset}`);
    }
    
    // Step 3: Get user document from Firestore
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
    
    // Step 4: Get admin profile from Firestore
    console.log(`\n${colors.cyan}Fetching admin profile from Firestore...${colors.reset}`);
    const adminProfileDoc = await getDoc(doc(db, 'admin_profiles', user.uid));
    
    if (!adminProfileDoc.exists()) {
      console.log(`${colors.red}✗ Admin profile not found in Firestore${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Admin profile found in Firestore${colors.reset}`);
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
    
    // Step 5: Sign out
    await signOut(auth);
    console.log(`\n${colors.green}✓ Successfully signed out${colors.reset}`);
    
    // Step 6: Summary
    console.log(`\n${colors.cyan}${colors.bright}=== Admin Login Test Summary ===${colors.reset}`);
    
    const hasAuthRecord = !!user;
    const hasAdminClaims = claims.role === 'ADMIN' && claims.isAdmin === true;
    const hasUserDoc = userDoc.exists() && userDoc.data().role === 'ADMIN' && userDoc.data().isAdmin === true;
    const hasAdminProfile = adminProfileDoc.exists();
    
    if (hasAuthRecord && hasAdminClaims && hasUserDoc && hasAdminProfile) {
      console.log(`${colors.green}${colors.bright}✓ Admin login test passed${colors.reset}`);
      console.log(`${colors.green}✓ User can access admin features${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}✗ Admin login test failed${colors.reset}`);
      
      if (!hasAuthRecord) console.log(`${colors.red}✗ User authentication failed${colors.reset}`);
      if (!hasAdminClaims) console.log(`${colors.red}✗ User does not have proper admin claims${colors.reset}`);
      if (!hasUserDoc) console.log(`${colors.red}✗ User document is missing or does not have admin role${colors.reset}`);
      if (!hasAdminProfile) console.log(`${colors.red}✗ Admin profile is missing${colors.reset}`);
      
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}Error testing admin login:${colors.reset}`, error);
    return false;
  }
}

// Run the script
testAdminLogin()
  .then((success) => {
    if (success) {
      console.log(`\n${colors.green}${colors.bright}Admin login test completed successfully.${colors.reset}`);
      console.log(`${colors.cyan}The admin user can log in and has the correct permissions.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bright}Admin login test failed.${colors.reset}`);
      console.log(`${colors.yellow}Please run the create:admin script first:${colors.reset}`);
      console.log(`${colors.cyan}npm run create:admin${colors.reset}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Script failed:${colors.reset}`, error);
    process.exit(1);
  }); 