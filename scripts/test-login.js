// This script tests login with sample users
// Run with: node scripts/test-login.js <email> <password>
// Example: node scripts/test-login.js john.doe@example.com Donor2024!

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error(`${colors.red}Please provide email and password as arguments${colors.reset}`);
  console.log(`Usage: node scripts/test-login.js <email> <password>`);
  console.log(`Example: node scripts/test-login.js john.doe@example.com Donor2024!`);
  process.exit(1);
}

// Sample users for reference
const sampleUsers = [
  { email: 'emma.parker@example.com', password: 'Volunteer2024!', role: 'VOLUNTEER', subRole: 'Program Lead' },
  { email: 'michael.chen@example.com', password: 'Community2024@', role: 'VOLUNTEER', subRole: 'Event Volunteer' },
  { email: 'sofia.rodriguez@example.com', password: 'Helping2024#', role: 'VOLUNTEER', subRole: 'Coordinator' },
  { email: 'john.doe@example.com', password: 'Donor2024!', role: 'DONOR', subRole: 'Regular Donor' },
  { email: 'sarah.smith@example.com', password: 'Giving2024@', role: 'DONOR', subRole: 'Monthly Donor' },
  { email: 'david.wilson@example.com', password: 'Support2024#', role: 'DONOR', subRole: 'Corporate Donor' }
];

async function testLogin() {
  console.log(`${colors.cyan}Testing login for ${email}...${colors.reset}`);
  
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`${colors.green}✓ Login successful!${colors.reset}`);
    console.log(`${colors.blue}User ID: ${user.uid}${colors.reset}`);
    console.log(`${colors.blue}Email: ${user.email}${colors.reset}`);
    console.log(`${colors.blue}Email verified: ${user.emailVerified}${colors.reset}`);
    
    // Get ID token with claims
    const idTokenResult = await user.getIdTokenResult();
    console.log(`${colors.blue}Custom claims:${colors.reset}`);
    console.log(`  ${colors.blue}Role: ${idTokenResult.claims.role || 'Not set'}${colors.reset}`);
    console.log(`  ${colors.blue}Sub-role: ${idTokenResult.claims.subRole || 'Not set'}${colors.reset}`);
    console.log(`  ${colors.blue}Status: ${idTokenResult.claims.status || 'Not set'}${colors.reset}`);
    
    // Get user document from Firestore
    console.log(`\n${colors.yellow}Fetching user data from Firestore...${colors.reset}`);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`${colors.green}✓ User document found in Firestore${colors.reset}`);
      console.log(`${colors.blue}Name: ${userData.name}${colors.reset}`);
      console.log(`${colors.blue}Role: ${userData.role}${colors.reset}`);
      console.log(`${colors.blue}Sub-role: ${userData.subRole}${colors.reset}`);
      console.log(`${colors.blue}Status: ${userData.status}${colors.reset}`);
      
      // Get profile document based on role
      const profileCollection = userData.role === 'DONOR' ? 'donor_profiles' : 'volunteer_profiles';
      const profileDoc = await getDoc(doc(db, profileCollection, user.uid));
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        console.log(`\n${colors.green}✓ ${userData.role.toLowerCase()} profile found${colors.reset}`);
        
        if (userData.role === 'DONOR') {
          console.log(`${colors.blue}Phone: ${profileData.phone}${colors.reset}`);
          console.log(`${colors.blue}Address: ${profileData.address}, ${profileData.city}, ${profileData.state}${colors.reset}`);
          if (profileData.donation_preferences) {
            console.log(`${colors.blue}Donation frequency: ${profileData.donation_preferences.frequency}${colors.reset}`);
            console.log(`${colors.blue}Preferred causes: ${profileData.donation_preferences.causes.join(', ')}${colors.reset}`);
          }
        } else if (userData.role === 'VOLUNTEER') {
          console.log(`${colors.blue}Phone: ${profileData.phone}${colors.reset}`);
          console.log(`${colors.blue}Address: ${profileData.address}, ${profileData.city}, ${profileData.state}${colors.reset}`);
          console.log(`${colors.blue}Skills: ${profileData.skills.join(', ')}${colors.reset}`);
          console.log(`${colors.blue}Experience: ${profileData.experience}${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ No ${userData.role.toLowerCase()} profile found${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ No user document found in Firestore${colors.reset}`);
    }
    
    // Sign out
    await signOut(auth);
    console.log(`\n${colors.green}✓ Successfully signed out${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Login failed:${colors.reset}`, error.message);
    console.error(`${colors.red}Error code:${colors.reset}`, error.code);
    
    // Provide helpful error messages
    if (error.code === 'auth/invalid-credential') {
      console.log(`${colors.yellow}The email or password is incorrect. Please check your credentials.${colors.reset}`);
      
      // List available sample users
      console.log(`\n${colors.yellow}Available sample users:${colors.reset}`);
      sampleUsers.forEach(user => {
        console.log(`- ${user.email} / ${user.password} (${user.role}: ${user.subRole})`);
      });
    } else if (error.code === 'auth/user-not-found') {
      console.log(`${colors.yellow}No user found with this email. Please check the email address.${colors.reset}`);
    } else if (error.code === 'auth/too-many-requests') {
      console.log(`${colors.yellow}Too many unsuccessful login attempts. Please try again later.${colors.reset}`);
    }
  }
}

// Run the test
testLogin()
  .then(() => {
    console.log(`${colors.cyan}Test completed${colors.reset}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Test failed:${colors.reset}`, error);
    process.exit(1);
  }); 