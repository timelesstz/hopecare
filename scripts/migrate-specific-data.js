// This script helps migrate specific data types or records from Supabase to Firebase
// Run with: node scripts/migrate-specific-data.js <collection> <filter-field> <filter-value>
// Example: node scripts/migrate-specific-data.js donations donor_id 123e4567-e89b-12d3-a456-426614174000

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Load environment variables
config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Firebase
initializeApp({
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

// Get command line arguments
const collection = process.argv[2];
const filterField = process.argv[3];
const filterValue = process.argv[4];

if (!collection) {
  console.error('Please provide a collection name to migrate.');
  console.log('Usage: node scripts/migrate-specific-data.js <collection> [filter-field] [filter-value]');
  console.log('Available collections:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

if (!tableMapping[collection]) {
  console.error(`Unknown collection: ${collection}`);
  console.log('Available collections:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

if ((filterField && !filterValue) || (!filterField && filterValue)) {
  console.error('If providing a filter, both field and value are required.');
  console.log('Usage: node scripts/migrate-specific-data.js <collection> <filter-field> <filter-value>');
  process.exit(1);
}

async function migrateData() {
  try {
    console.log(`Starting migration of ${collection}${filterField ? ` where ${filterField} = ${filterValue}` : ''}`);
    
    // Build query
    let query = supabase.from(collection).select('*');
    
    // Add filter if provided
    if (filterField && filterValue) {
      query = query.eq(filterField, filterValue);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching data from ${collection}:`, error);
      return;
    }
    
    console.log(`Found ${data.length} records to migrate`);
    
    // Determine the Firestore collection name
    const firestoreCollection = tableMapping[collection];
    
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
        await db.collection(firestoreCollection).doc(docId).set(processedRecord);
        
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`Migrated ${successCount} records so far...`);
        }
      } catch (recordError) {
        console.error(`Error migrating record ${record.id}:`, recordError);
        errorCount++;
      }
    }
    
    console.log(`Migration completed for ${collection}:`);
    console.log(`- Successfully migrated: ${successCount} records`);
    console.log(`- Failed to migrate: ${errorCount} records`);
    
  } catch (error) {
    console.error(`Migration failed for ${collection}:`, error);
  }
}

// Process record to handle special data types
function processRecord(record) {
  const processed = {};
  
  for (const [key, value] of Object.entries(record)) {
    // Handle null values
    if (value === null) {
      processed[key] = null;
      continue;
    }
    
    // Handle Date objects or ISO date strings
    if (value instanceof Date) {
      processed[key] = value.toISOString();
      continue;
    }
    
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      processed[key] = value; // Keep ISO date strings as is
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      processed[key] = value.map(item => {
        if (typeof item === 'object' && item !== null) {
          return processRecord(item);
        }
        return item;
      });
      continue;
    }
    
    // Handle nested objects
    if (typeof value === 'object') {
      processed[key] = processRecord(value);
      continue;
    }
    
    // Default case: copy the value as is
    processed[key] = value;
  }
  
  return processed;
}

// Run the migration
migrateData()
  .then(() => {
    console.log('Migration script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 