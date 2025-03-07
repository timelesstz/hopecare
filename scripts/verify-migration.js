// This script verifies that data has been correctly migrated from Supabase to Firebase
// Run with: node scripts/verify-migration.js <collection>
// Example: node scripts/verify-migration.js users

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

if (!collection) {
  console.error('Please provide a collection name to verify.');
  console.log('Usage: node scripts/verify-migration.js <collection>');
  console.log('Available collections:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

if (!tableMapping[collection]) {
  console.error(`Unknown collection: ${collection}`);
  console.log('Available collections:', Object.keys(tableMapping).join(', '));
  process.exit(1);
}

async function verifyMigration() {
  try {
    console.log(`Verifying migration of ${collection}...`);
    
    // Get data from Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from(collection)
      .select('*');
    
    if (supabaseError) {
      console.error(`Error fetching data from Supabase ${collection}:`, supabaseError);
      return;
    }
    
    console.log(`Found ${supabaseData.length} records in Supabase ${collection}`);
    
    // Get data from Firestore
    const firestoreCollection = tableMapping[collection];
    const firestoreSnapshot = await db.collection(firestoreCollection).get();
    const firestoreData = firestoreSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${firestoreData.length} records in Firestore ${firestoreCollection}`);
    
    // Compare record counts
    if (supabaseData.length === firestoreData.length) {
      console.log('✅ Record counts match');
    } else {
      console.log('❌ Record counts do not match');
      console.log(`   Supabase: ${supabaseData.length}`);
      console.log(`   Firestore: ${firestoreData.length}`);
    }
    
    // Check for missing records
    const supabaseIds = new Set(supabaseData.map(record => record.id));
    const firestoreIds = new Set(firestoreData.map(record => record.id));
    
    const missingInFirestore = [...supabaseIds].filter(id => !firestoreIds.has(id));
    const extraInFirestore = [...firestoreIds].filter(id => !supabaseIds.has(id));
    
    if (missingInFirestore.length > 0) {
      console.log(`❌ ${missingInFirestore.length} records from Supabase are missing in Firestore`);
      if (missingInFirestore.length <= 5) {
        console.log('   Missing IDs:', missingInFirestore);
      } else {
        console.log('   First 5 missing IDs:', missingInFirestore.slice(0, 5));
      }
    } else {
      console.log('✅ All Supabase records exist in Firestore');
    }
    
    if (extraInFirestore.length > 0) {
      console.log(`ℹ️ ${extraInFirestore.length} records in Firestore don't exist in Supabase`);
      if (extraInFirestore.length <= 5) {
        console.log('   Extra IDs:', extraInFirestore);
      } else {
        console.log('   First 5 extra IDs:', extraInFirestore.slice(0, 5));
      }
    } else {
      console.log('✅ No extra records in Firestore');
    }
    
    // Compare sample records
    console.log('\nComparing sample records:');
    const sampleSize = Math.min(5, supabaseData.length);
    let matchCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const supabaseRecord = supabaseData[i];
      const firestoreRecord = firestoreData.find(r => r.id === supabaseRecord.id);
      
      if (!firestoreRecord) {
        console.log(`❌ Record ${supabaseRecord.id} not found in Firestore`);
        continue;
      }
      
      // Compare fields
      const fieldDifferences = compareRecords(supabaseRecord, firestoreRecord);
      
      if (fieldDifferences.length === 0) {
        console.log(`✅ Record ${supabaseRecord.id} matches`);
        matchCount++;
      } else {
        console.log(`❌ Record ${supabaseRecord.id} has differences:`);
        fieldDifferences.forEach(diff => {
          console.log(`   - ${diff}`);
        });
      }
    }
    
    console.log(`\n${matchCount} out of ${sampleSize} sample records match exactly`);
    
    // Overall assessment
    if (supabaseData.length === firestoreData.length && missingInFirestore.length === 0 && matchCount === sampleSize) {
      console.log('\n🎉 Migration verification successful! Data appears to be correctly migrated.');
    } else {
      console.log('\n⚠️ Migration verification found issues. Please review the differences above.');
    }
    
  } catch (error) {
    console.error(`Verification failed for ${collection}:`, error);
  }
}

// Compare two records and return an array of differences
function compareRecords(record1, record2) {
  const differences = [];
  
  // Get all unique keys from both records
  const allKeys = new Set([...Object.keys(record1), ...Object.keys(record2)]);
  
  for (const key of allKeys) {
    // Skip comparison for certain fields that might be different by design
    if (['created_at', 'updated_at'].includes(key)) {
      continue;
    }
    
    const value1 = record1[key];
    const value2 = record2[key];
    
    // Check if the key exists in both records
    if (!(key in record1)) {
      differences.push(`Field '${key}' exists in Firestore but not in Supabase`);
      continue;
    }
    
    if (!(key in record2)) {
      differences.push(`Field '${key}' exists in Supabase but not in Firestore`);
      continue;
    }
    
    // Compare values
    if (typeof value1 !== typeof value2) {
      differences.push(`Field '${key}' has different types: ${typeof value1} vs ${typeof value2}`);
      continue;
    }
    
    // Handle different value types
    if (value1 === null && value2 === null) {
      continue; // Both null, no difference
    }
    
    if (value1 === null || value2 === null) {
      differences.push(`Field '${key}' is null in one record but not the other`);
      continue;
    }
    
    if (typeof value1 === 'object') {
      // For objects, do a simple JSON comparison
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        differences.push(`Field '${key}' has different object values`);
      }
    } else if (value1 !== value2) {
      differences.push(`Field '${key}' has different values: '${value1}' vs '${value2}'`);
    }
  }
  
  return differences;
}

// Run the verification
verifyMigration()
  .then(() => {
    console.log('Verification script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
  }); 