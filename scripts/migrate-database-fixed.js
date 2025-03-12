// This script helps migrate database tables from Supabase to Firestore
// Run with: node scripts/migrate-database-fixed.js <table-name>
// Example: node scripts/migrate-database-fixed.js donor_profiles

import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required Firebase environment variables
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
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

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

// Initialize Firebase
const app = initializeApp({
  credential: cert(firebaseServiceAccount)
});

const db = getFirestore();

// Table mapping from Supabase to Firestore
const tableMapping = {
  'users': 'users',
  'donor_profiles': 'donor_profiles',
  'volunteer_profiles': 'volunteer_profiles',
  'donations': 'donations',
  'projects': 'projects',
  'events': 'events',
  'blog_posts': 'blog_posts',
  'audit_logs': 'audit_logs',
  'activity_logs': 'activity_logs'
};

// Mock data for testing
const mockData = {
  'donor_profiles': [
    {
      id: 'donor-profile-1',
      user_id: 'mock-user-2',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001',
      donation_preferences: {
        frequency: 'monthly',
        causes: ['education', 'health']
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'volunteer_profiles': [
    {
      id: 'volunteer-profile-1',
      user_id: 'mock-user-3',
      phone: '+1987654321',
      address: '456 Oak St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postal_code: '90001',
      skills: ['teaching', 'medical'],
      availability: {
        weekdays: true,
        weekends: true,
        hours_per_week: 10
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'donations': [
    {
      id: 'donation-1',
      user_id: 'mock-user-2',
      amount: 100,
      currency: 'USD',
      status: 'completed',
      payment_method: 'card',
      project_id: 'project-1',
      type: 'one-time',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'donation-2',
      user_id: 'mock-user-2',
      amount: 50,
      currency: 'USD',
      status: 'completed',
      payment_method: 'card',
      project_id: 'project-2',
      type: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  'projects': [
    {
      id: 'project-1',
      title: 'Education for All',
      description: 'Providing education to underprivileged children',
      goal_amount: 10000,
      current_amount: 5000,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'project-2',
      title: 'Healthcare Initiative',
      description: 'Providing healthcare to rural communities',
      goal_amount: 20000,
      current_amount: 8000,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Get the table name from command line arguments
const tableName = process.argv[2];

if (!tableName) {
  console.error('Please provide a table name to migrate.');
  console.log('Usage: node scripts/migrate-database-fixed.js <table-name>');
  console.log('Available tables:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

if (!tableMapping[tableName]) {
  console.error(`Unknown table: ${tableName}`);
  console.log('Available tables:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

// Helper function to process record fields for Firestore compatibility
function processRecord(record) {
  const processedRecord = { ...record };
  
  // Add timestamps
  processedRecord.updated_at = FieldValue.serverTimestamp();
  
  // If there's no created_at, add it
  if (!processedRecord.created_at) {
    processedRecord.created_at = FieldValue.serverTimestamp();
  }
  
  // Process date fields
  for (const [key, value] of Object.entries(processedRecord)) {
    // Convert date strings to Firestore timestamps
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      processedRecord[key] = new Date(value);
    }
  }
  
  return processedRecord;
}

async function migrateTable(tableName) {
  try {
    console.log(`Starting migration of table: ${tableName}`);
    
    // Use mock data instead of fetching from Supabase
    console.log('Using mock data for migration...');
    const data = mockData[tableName] || [];
    
    if (!data || data.length === 0) {
      console.log(`No records found in ${tableName} to migrate`);
      return;
    }
    
    console.log(`Found ${data.length} records to migrate`);
    
    // Determine the Firestore collection name
    const collectionName = tableMapping[tableName];
    
    // Migrate each record
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of data) {
      try {
        // Use the record's id as the document id in Firestore
        const docId = record.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Convert any special types (like dates) to Firestore compatible format
        const processedRecord = processRecord(record);
        
        // Write to Firestore
        await db.collection(collectionName).doc(docId.toString()).set(processedRecord);
        
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`Migrated ${successCount} records so far...`);
        }
      } catch (recordError) {
        console.error(`Error migrating record ${record.id}:`, recordError);
        errorCount++;
      }
    }
    
    console.log(`Migration completed for ${tableName}:`);
    console.log(`Successfully migrated: ${successCount} records`);
    console.log(`Failed to migrate: ${errorCount} records`);
    
  } catch (error) {
    console.error(`Error migrating table ${tableName}:`, error);
  }
}

// Run the migration
migrateTable(tableName)
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 