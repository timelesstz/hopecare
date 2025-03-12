// This script tests the Firebase setup by checking configuration, creating a test user,
// and verifying database access.
// Run with: node scripts/test-firebase-setup.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Load environment variables
config();

// Check if required environment variables are set
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease add these variables to your .env file.');
  process.exit(1);
}

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

console.log('🔍 Testing Firebase configuration...');

// Initialize Firebase
let auth;
let db;

try {
  initializeApp({
    credential: cert(firebaseServiceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
  
  auth = getAuth();
  db = getFirestore();
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Test functions
async function testAuth() {
  console.log('\n🔐 Testing Firebase Authentication...');
  
  try {
    // Create a test user with a random email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test1234!';
    const testDisplayName = 'Test User';
    
    // Create the user
    const userRecord = await auth.createUser({
      email: testEmail,
      password: testPassword,
      displayName: testDisplayName,
      emailVerified: true
    });
    
    console.log(`✅ Created test user: ${userRecord.uid}`);
    
    // Get the user
    const fetchedUser = await auth.getUser(userRecord.uid);
    console.log(`✅ Retrieved user: ${fetchedUser.email}`);
    
    // Delete the test user
    await auth.deleteUser(userRecord.uid);
    console.log(`✅ Deleted test user: ${userRecord.uid}`);
    
    return userRecord.uid;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return null;
  }
}

async function testFirestore(userId) {
  console.log('\n📄 Testing Firestore Database...');
  
  if (!userId) {
    userId = `test-${Date.now()}`;
  }
  
  try {
    // Create a test document
    const testCollection = 'test_collection';
    const testDocRef = db.collection(testCollection).doc(userId);
    
    await testDocRef.set({
      name: 'Test Document',
      timestamp: new Date().toISOString(),
      value: Math.random()
    });
    
    console.log(`✅ Created test document in ${testCollection}`);
    
    // Read the document
    const docSnapshot = await testDocRef.get();
    if (docSnapshot.exists) {
      console.log(`✅ Retrieved test document: ${JSON.stringify(docSnapshot.data())}`);
    } else {
      console.error('❌ Test document not found');
    }
    
    // Update the document
    await testDocRef.update({
      updated: true,
      updateTimestamp: new Date().toISOString()
    });
    
    console.log(`✅ Updated test document`);
    
    // Delete the document
    await testDocRef.delete();
    console.log(`✅ Deleted test document`);
    
    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return false;
  }
}

async function testCollections() {
  console.log('\n📚 Testing required collections...');
  
  const requiredCollections = [
    'users',
    'donor_profiles',
    'volunteer_profiles',
    'donations'
  ];
  
  try {
    for (const collectionName of requiredCollections) {
      // Check if collection exists by trying to get a document
      const snapshot = await db.collection(collectionName).limit(1).get();
      
      if (snapshot.empty) {
        console.log(`ℹ️ Collection '${collectionName}' exists but is empty`);
      } else {
        console.log(`✅ Collection '${collectionName}' exists and contains data`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Collections test failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Firebase setup tests...');
  
  const userId = await testAuth();
  const firestoreResult = await testFirestore(userId);
  const collectionsResult = await testCollections();
  
  console.log('\n📋 Test Summary:');
  console.log(`Authentication: ${userId ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Firestore: ${firestoreResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Collections: ${collectionsResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (userId && firestoreResult && collectionsResult) {
    console.log('\n🎉 All tests passed! Your Firebase setup is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 