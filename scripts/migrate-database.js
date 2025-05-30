// This script helps migrate database tables from Supabase to Firestore
// Run with: node scripts/migrate-database.js <table-name>
// Example: node scripts/migrate-database.js donor_profiles

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
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

// Get the table name from command line arguments
const tableName = process.argv[2];

if (!tableName) {
  console.error('Please provide a table name to migrate.');
  console.log('Usage: node scripts/migrate-database.js <table-name>');
  console.log('Available tables:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

if (!tableMapping[tableName]) {
  console.error(`Unknown table: ${tableName}`);
  console.log('Available tables:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

async function migrateTable(tableName) {
  try {
    console.log(`Starting migration of table: ${tableName}`);
    
    // Get all records from Supabase table
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
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
        await db.collection(collectionName).doc(docId).set(processedRecord);
        
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
    console.log(`