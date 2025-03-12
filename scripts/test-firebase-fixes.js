import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Only add measurementId if it's properly defined
if (process.env.VITE_FIREBASE_MEASUREMENT_ID && 
    process.env.VITE_FIREBASE_MEASUREMENT_ID !== 'G-MEASUREMENT-ID') {
  firebaseConfig.measurementId = process.env.VITE_FIREBASE_MEASUREMENT_ID;
}

console.log(`${colors.cyan}Firebase Configuration:${colors.reset}`);
console.log(JSON.stringify(firebaseConfig, null, 2));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testLogin(email, password) {
  console.log(`\n${colors.bright}Testing login with ${email}${colors.reset}`);
  
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`${colors.green}✓ Login successful${colors.reset}`);
    console.log(`User ID: ${userCredential.user.uid}`);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`\n${colors.cyan}User data from Firestore:${colors.reset}`);
      
      // Print user data
      console.log(`Email: ${userData.email}`);
      console.log(`Name: ${userData.name}`);
      console.log(`Role: ${userData.role}`);
      console.log(`Status: ${userData.status || 'ACTIVE'}`);
      
      // Handle timestamps
      console.log(`\n${colors.cyan}Timestamp handling:${colors.reset}`);
      
      if (userData.last_login) {
        const lastLoginDate = new Date(userData.last_login.seconds * 1000);
        console.log(`Last login: ${lastLoginDate.toISOString()}`);
      } else {
        console.log(`Last login: null`);
      }
      
      if (userData.created_at) {
        const createdAtDate = new Date(userData.created_at.seconds * 1000);
        console.log(`Created at: ${createdAtDate.toISOString()}`);
      }
      
      if (userData.updated_at) {
        const updatedAtDate = new Date(userData.updated_at.seconds * 1000);
        console.log(`Updated at: ${updatedAtDate.toISOString()}`);
      }
      
      // Check if timestamps are objects
      console.log(`\n${colors.cyan}Timestamp types:${colors.reset}`);
      console.log(`last_login type: ${userData.last_login ? typeof userData.last_login : 'null'}`);
      console.log(`created_at type: ${typeof userData.created_at}`);
      console.log(`updated_at type: ${typeof userData.updated_at}`);
      
      if (userData.last_login) {
        console.log(`last_login has seconds: ${userData.last_login.seconds !== undefined}`);
      }
      if (userData.created_at) {
        console.log(`created_at has seconds: ${userData.created_at.seconds !== undefined}`);
      }
      if (userData.updated_at) {
        console.log(`updated_at has seconds: ${userData.updated_at.seconds !== undefined}`);
      }
    } else {
      console.log(`${colors.red}✗ User document not found in Firestore${colors.reset}`);
    }
    
    // Sign out
    await auth.signOut();
    console.log(`\n${colors.green}✓ Signed out successfully${colors.reset}`);
    
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Get email and password from command line arguments
const email = process.argv[2] || 'john.doe@example.com';
const password = process.argv[3] || 'Donor2024!';

// Run the test
testLogin(email, password)
  .then(() => {
    console.log(`\n${colors.green}Test completed${colors.reset}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}Test failed:${colors.reset}`, error);
    process.exit(1);
  }); 