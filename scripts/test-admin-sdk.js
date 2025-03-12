#!/usr/bin/env node

/**
 * Test script to verify Firebase Admin SDK update
 * Run with: node scripts/test-admin-sdk.js
 */

import { config } from 'dotenv';
import { initializeApp, cert, SDK_VERSION } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import loadServiceAccount from './utils/service-account.js';

// Load environment variables
config();

// Load the Firebase service account
const serviceAccount = loadServiceAccount();

console.log('Testing Firebase Admin SDK...');
console.log(`Firebase Admin SDK Version: ${SDK_VERSION}`);
console.log(`Project ID: ${serviceAccount.project_id}`);
console.log(`Client Email: ${serviceAccount.client_email}`);

async function testAdminSDK() {
  try {
    // Initialize Firebase Admin SDK
    const app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Get service instances
    const auth = getAuth(app);
    console.log('Auth service initialized successfully');
    
    try {
      const db = getFirestore(app);
      console.log('Firestore service initialized successfully');
      
      // Test Firestore
      console.log('Testing Firestore...');
      try {
        const testDoc = db.collection('test').doc('admin-sdk-test');
        
        // Test write operation
        await testDoc.set({
          message: 'Firebase Admin SDK test',
          timestamp: FieldValue.serverTimestamp()
        });
        console.log('Firestore write operation successful');
        
        // Test read operation
        const docSnapshot = await testDoc.get();
        console.log('Firestore read operation successful');
        console.log('Test document data:', docSnapshot.data());
        
        // Clean up test document
        await testDoc.delete();
        console.log('Test document deleted successfully');
      } catch (firestoreError) {
        if (firestoreError.code === 7 && firestoreError.details?.includes('SERVICE_DISABLED')) {
          console.warn('Firestore API is not enabled for this project. Please enable it in the Firebase console.');
          console.warn(`Visit: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
        } else {
          throw firestoreError;
        }
      }
    } catch (dbError) {
      console.warn('Could not initialize Firestore:', dbError.message);
    }
    
    try {
      const storage = getStorage(app);
      console.log('Storage service initialized successfully');
    } catch (storageError) {
      console.warn('Could not initialize Storage:', storageError.message);
    }
    
    console.log('\nFirebase Admin SDK test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing Firebase Admin SDK:', error);
    return false;
  }
}

// Run the test
testAdminSDK()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 