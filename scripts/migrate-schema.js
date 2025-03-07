// This script migrates Supabase schema to Firebase Firestore
// Run with: node scripts/migrate-schema.js

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Initialize Firebase
initializeApp({
  credential: cert(firebaseServiceAccount)
});

const db = getFirestore();

// Function to create Firestore collections and set up security rules
async function migrateSchema() {
  console.log('Starting schema migration to Firebase Firestore...');

  try {
    // Create collections based on Supabase tables
    const collections = [
      {
        name: 'donations',
        description: 'Stores donation records',
        fields: [
          { name: 'amount', type: 'number', required: true },
          { name: 'currency', type: 'string', defaultValue: 'KES' },
          { name: 'type', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
          { name: 'payment_intent_id', type: 'string' },
          { name: 'provider', type: 'string', defaultValue: 'unlimit' },
          { name: 'metadata', type: 'object' },
          { name: 'user_id', type: 'string', reference: 'users' },
          { name: 'created_at', type: 'timestamp', defaultValue: 'now' },
          { name: 'updated_at', type: 'timestamp', defaultValue: 'now' }
        ]
      },
      {
        name: 'analytics_events',
        description: 'Stores analytics events',
        fields: [
          { name: 'event_name', type: 'string', required: true },
          { name: 'properties', type: 'object', defaultValue: {} },
          { name: 'timestamp', type: 'timestamp', defaultValue: 'now' },
          { name: 'user_id', type: 'string', reference: 'users' },
          { name: 'created_at', type: 'timestamp', defaultValue: 'now' }
        ]
      },
      {
        name: 'volunteer_availability',
        description: 'Stores volunteer availability',
        fields: [
          { name: 'volunteer_id', type: 'string', reference: 'users', required: true },
          { name: 'day', type: 'string', required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
          { name: 'start_time', type: 'string', required: true },
          { name: 'end_time', type: 'string', required: true },
          { name: 'is_recurring', type: 'boolean', defaultValue: true },
          { name: 'created_at', type: 'timestamp', defaultValue: 'now' },
          { name: 'updated_at', type: 'timestamp', defaultValue: 'now' }
        ]
      },
      {
        name: 'profiles',
        description: 'Stores user profiles',
        fields: [
          { name: 'first_name', type: 'string', required: true },
          { name: 'last_name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'phone', type: 'string' },
          { name: 'birth_date', type: 'timestamp' },
          { name: 'address', type: 'string' },
          { name: 'preferred_communication', type: 'string', enum: ['email', 'phone', 'both'] },
          { name: 'interests', type: 'array' },
          { name: 'role', type: 'string', defaultValue: 'USER', required: true },
          { name: 'created_at', type: 'timestamp', defaultValue: 'now' },
          { name: 'updated_at', type: 'timestamp', defaultValue: 'now' }
        ]
      },
      {
        name: 'logs',
        description: 'System logs for debugging and auditing',
        fields: [
          { name: 'level', type: 'string', required: true },
          { name: 'category', type: 'string', required: true },
          { name: 'message', type: 'string', required: true },
          { name: 'details', type: 'object' },
          { name: 'user_id', type: 'string', reference: 'users' },
          { name: 'created_at', type: 'timestamp', defaultValue: 'now' }
        ]
      }
    ];

    // Create a document in a special collection to store schema information
    await db.collection('_schema').doc('collections').set({
      collections: collections,
      migrated_at: new Date().toISOString(),
      version: '1.0.0'
    });

    console.log('Schema migration completed successfully!');
    
    // Generate Firestore security rules
    const securityRules = generateFirestoreSecurityRules(collections);
    
    // Save security rules to a file
    fs.writeFileSync(
      path.join(__dirname, '../firestore.rules'),
      securityRules,
      'utf8'
    );
    
    console.log('Firestore security rules generated and saved to firestore.rules');
    
    return true;
  } catch (error) {
    console.error('Error migrating schema:', error);
    return false;
  }
}

// Function to generate Firestore security rules based on collections
function generateFirestoreSecurityRules(collections) {
  let rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rules
    match /{document=**} {
      allow read, write: if false; // Default deny
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user is accessing their own data
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user has admin role
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isUser(userId);
      allow update: if isUser(userId) || isAdmin();
      allow delete: if isAdmin();
    }
`;

  // Add rules for each collection
  collections.forEach(collection => {
    if (collection.name === 'users') return; // Already handled

    let collectionRules = `
    // ${collection.description}
    match /${collection.name}/{docId} {
`;

    // Default rules based on collection type
    switch (collection.name) {
      case 'donations':
        collectionRules += `
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || 
        (resource.data.user_id == request.auth.uid);
`;
        break;
      
      case 'analytics_events':
        collectionRules += `
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
`;
        break;
      
      case 'volunteer_availability':
        collectionRules += `
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin() || 
        (resource.data.volunteer_id == request.auth.uid);
`;
        break;
      
      case 'profiles':
        collectionRules += `
      allow read: if isAuthenticated();
      allow create: if isUser(docId);
      allow update: if isUser(docId) || isAdmin();
      allow delete: if isAdmin();
`;
        break;
      
      case 'logs':
        collectionRules += `
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
`;
        break;
      
      default:
        collectionRules += `
      allow read: if isAuthenticated();
      allow write: if isAdmin();
`;
    }

    collectionRules += `    }
`;
    rules += collectionRules;
  });

  rules += `  }
}`;

  return rules;
}

// Run the migration
migrateSchema()
  .then(success => {
    if (success) {
      console.log('Schema migration completed successfully.');
      process.exit(0);
    } else {
      console.error('Schema migration failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during schema migration:', error);
    process.exit(1);
  }); 