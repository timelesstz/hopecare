/**
 * Firebase to Supabase Migration Script
 * 
 * This script migrates data from Firebase Firestore to Supabase.
 * It reads data from Firebase collections and imports it into the corresponding Supabase tables.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config();

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Firebase service account file not found at ${serviceAccountPath}`);
  console.error('Please provide a valid service account file path in FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
  process.exit(1);
}

// Initialize Firebase
const firebaseApp = initializeApp({
  credential: cert(serviceAccountPath)
});
const firestore = getFirestore(firebaseApp);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

// Create Supabase client with service role key (for admin operations)
const supabase = createClient(supabaseUrl, supabaseKey);

// Collection mapping from Firebase to Supabase
const collectionMapping = {
  'users': 'users',
  'donor_profiles': 'donor_profiles',
  'volunteer_profiles': 'volunteer_profiles',
  'admin_profiles': 'admin_profiles',
  'donations': 'donations',
  'blog_posts': 'blog_posts',
  'pages': 'pages',
  'volunteer_opportunities': 'volunteer_opportunities',
  'volunteer_assignments': 'volunteer_assignments',
  'volunteer_hours': 'volunteer_hours',
  'background_checks': 'background_checks'
};

// Field mapping for each collection (Firebase field name -> Supabase field name)
const fieldMapping = {
  'users': {
    'id': 'id',
    'email': 'email',
    'displayName': 'display_name',
    'role': 'role',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  'donor_profiles': {
    'id': 'id',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'email': 'email',
    'phone': 'phone',
    'address': 'address',
    'preferredCauses': 'preferred_causes',
    'donationFrequency': 'donation_frequency',
    'isAnonymous': 'is_anonymous',
    'receiveUpdates': 'receive_updates',
    'totalDonated': 'total_donated',
    'donationCount': 'donation_count',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  'volunteer_profiles': {
    'id': 'id',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'email': 'email',
    'phone': 'phone',
    'skills': 'skills',
    'languages': 'languages',
    'experience': 'experience',
    'availability.weekdays': 'weekday_availability',
    'availability.weekends': 'weekend_availability',
    'availability.evenings': 'evening_availability',
    'emergencyContact.name': 'emergency_contact_name',
    'emergencyContact.phone': 'emergency_contact_phone',
    'emergencyContact.relationship': 'emergency_contact_relationship',
    'hoursLogged': 'hours_logged',
    'eventsAttended': 'events_attended',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  }
  // Add mappings for other collections as needed
};

/**
 * Transform Firebase document to Supabase format
 * @param {Object} doc - Firebase document
 * @param {string} collection - Collection name
 * @returns {Object} - Transformed document for Supabase
 */
function transformDocument(doc, collection) {
  const mapping = fieldMapping[collection] || {};
  const result = {};

  // Process each field according to the mapping
  Object.entries(doc).forEach(([key, value]) => {
    const targetField = mapping[key];
    
    if (targetField) {
      // Handle nested fields
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = doc;
        for (const part of parts) {
          if (current && current[part] !== undefined) {
            current = current[part];
          } else {
            current = undefined;
            break;
          }
        }
        result[targetField] = current;
      } else {
        // Handle date conversions
        if (value && value._seconds && value._nanoseconds) {
          // Firestore Timestamp to ISO string
          result[targetField] = new Date(value._seconds * 1000).toISOString();
        } else if (key === 'createdAt' || key === 'updatedAt') {
          // Convert any date format to ISO string
          result[targetField] = value ? new Date(value).toISOString() : new Date().toISOString();
        } else {
          result[targetField] = value;
        }
      }
    } else {
      // If no mapping exists, use the original field name in snake_case
      const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeCaseKey] = value;
    }
  });

  return result;
}

/**
 * Migrate a single collection
 * @param {string} sourceCollection - Firebase collection name
 * @param {string} targetTable - Supabase table name
 * @returns {Promise<void>}
 */
async function migrateCollection(sourceCollection, targetTable) {
  console.log(`Migrating collection: ${sourceCollection} -> ${targetTable}`);
  
  try {
    // Get all documents from Firebase
    const snapshot = await firestore.collection(sourceCollection).get();
    
    if (snapshot.empty) {
      console.log(`No documents found in ${sourceCollection}`);
      return;
    }
    
    const documents = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure ID is included
      const docWithId = { id: doc.id, ...data };
      const transformedDoc = transformDocument(docWithId, sourceCollection);
      documents.push(transformedDoc);
    });
    
    console.log(`Found ${documents.length} documents in ${sourceCollection}`);
    
    // Batch insert into Supabase
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const { error } = await supabase.from(targetTable).upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error inserting batch into ${targetTable}:`, error);
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1} into ${targetTable}`);
      }
    }
    
    console.log(`Completed migration of ${sourceCollection} -> ${targetTable}`);
  } catch (error) {
    console.error(`Error migrating ${sourceCollection}:`, error);
  }
}

/**
 * Migrate Firebase certifications to Supabase
 * @returns {Promise<void>}
 */
async function migrateVolunteerCertifications() {
  console.log('Migrating volunteer certifications');
  
  try {
    // Get all volunteer profiles from Firebase
    const snapshot = await firestore.collection('volunteer_profiles').get();
    
    if (snapshot.empty) {
      console.log('No volunteer profiles found');
      return;
    }
    
    const certifications = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const volunteerId = doc.id;
      
      if (data.certifications && Array.isArray(data.certifications)) {
        data.certifications.forEach(cert => {
          certifications.push({
            volunteer_id: volunteerId,
            name: cert.name,
            issue_date: cert.issueDate ? new Date(cert.issueDate).toISOString() : new Date().toISOString(),
            expiry_date: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }
    });
    
    console.log(`Found ${certifications.length} certifications to migrate`);
    
    // Batch insert into Supabase
    const batchSize = 100;
    for (let i = 0; i < certifications.length; i += batchSize) {
      const batch = certifications.slice(i, i + batchSize);
      const { error } = await supabase.from('volunteer_certifications').insert(batch);
      
      if (error) {
        console.error('Error inserting certifications batch:', error);
      } else {
        console.log(`Successfully inserted certifications batch ${i / batchSize + 1}`);
      }
    }
    
    console.log('Completed migration of volunteer certifications');
  } catch (error) {
    console.error('Error migrating volunteer certifications:', error);
  }
}

/**
 * Migrate Firebase donation metadata to Supabase
 * @returns {Promise<void>}
 */
async function migrateDonationMetadata() {
  console.log('Migrating donation metadata');
  
  try {
    // Get all donations from Firebase
    const snapshot = await firestore.collection('donations').get();
    
    if (snapshot.empty) {
      console.log('No donations found');
      return;
    }
    
    const metadataItems = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const donationId = doc.id;
      
      if (data.metadata && typeof data.metadata === 'object') {
        Object.entries(data.metadata).forEach(([key, value]) => {
          metadataItems.push({
            donation_id: donationId,
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : value,
            created_at: new Date().toISOString()
          });
        });
      }
    });
    
    console.log(`Found ${metadataItems.length} metadata items to migrate`);
    
    // Batch insert into Supabase
    const batchSize = 100;
    for (let i = 0; i < metadataItems.length; i += batchSize) {
      const batch = metadataItems.slice(i, i + batchSize);
      const { error } = await supabase.from('donation_metadata').insert(batch);
      
      if (error) {
        console.error('Error inserting metadata batch:', error);
      } else {
        console.log(`Successfully inserted metadata batch ${i / batchSize + 1}`);
      }
    }
    
    console.log('Completed migration of donation metadata');
  } catch (error) {
    console.error('Error migrating donation metadata:', error);
  }
}

/**
 * Validate data integrity after migration
 * @returns {Promise<void>}
 */
async function validateDataIntegrity() {
  console.log('Validating data integrity');
  
  for (const [sourceCollection, targetTable] of Object.entries(collectionMapping)) {
    try {
      // Count documents in Firebase
      const firebaseSnapshot = await firestore.collection(sourceCollection).count().get();
      const firebaseCount = firebaseSnapshot.data().count;
      
      // Count records in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from(targetTable)
        .select('*', { count: 'exact', head: true });
      
      if (supabaseError) {
        console.error(`Error counting records in ${targetTable}:`, supabaseError);
        continue;
      }
      
      const supabaseCount = supabaseData.count || 0;
      
      console.log(`Collection: ${sourceCollection} -> ${targetTable}`);
      console.log(`  Firebase count: ${firebaseCount}`);
      console.log(`  Supabase count: ${supabaseCount}`);
      
      if (firebaseCount !== supabaseCount) {
        console.warn(`  ⚠️ Count mismatch! Some records may not have been migrated correctly.`);
      } else {
        console.log(`  ✅ Counts match!`);
      }
    } catch (error) {
      console.error(`Error validating ${sourceCollection} -> ${targetTable}:`, error);
    }
  }
  
  console.log('Data integrity validation complete');
}

/**
 * Main migration function
 */
async function migrateData() {
  console.log('Starting Firebase to Supabase migration...');
  
  // Migrate collections in order (respecting foreign key constraints)
  await migrateCollection('users', 'users');
  await migrateCollection('donor_profiles', 'donor_profiles');
  await migrateCollection('volunteer_profiles', 'volunteer_profiles');
  await migrateCollection('admin_profiles', 'admin_profiles');
  await migrateVolunteerCertifications();
  await migrateCollection('volunteer_opportunities', 'volunteer_opportunities');
  await migrateCollection('volunteer_assignments', 'volunteer_assignments');
  await migrateCollection('volunteer_hours', 'volunteer_hours');
  await migrateCollection('background_checks', 'background_checks');
  await migrateCollection('donations', 'donations');
  await migrateDonationMetadata();
  await migrateCollection('blog_posts', 'blog_posts');
  await migrateCollection('pages', 'pages');
  
  // Validate data integrity
  await validateDataIntegrity();
  
  console.log('Migration complete!');
}

// Run the migration
migrateData().catch(error => {
  console.error('Unhandled error in migration script:', error);
  process.exit(1);
});
