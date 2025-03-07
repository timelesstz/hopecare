#!/usr/bin/env node

/**
 * Script to deploy Firestore indexes
 * 
 * This script deploys the Firestore indexes defined in firestore.indexes.json
 * to the Firebase project.
 * 
 * Usage:
 *   node scripts/deploy-firestore-indexes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if firestore.indexes.json exists
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.error('Error: firestore.indexes.json not found');
  process.exit(1);
}

// Parse the indexes file to validate it
try {
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  const indexes = JSON.parse(indexesContent);
  
  console.log(`Found ${indexes.indexes.length} indexes to deploy`);
  
  // Log the indexes that will be deployed
  indexes.indexes.forEach((index, i) => {
    const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
    console.log(`${i + 1}. Collection: ${index.collectionGroup}, Fields: ${fields}`);
  });
} catch (error) {
  console.error('Error parsing firestore.indexes.json:', error.message);
  process.exit(1);
}

// Deploy the indexes
console.log('\nDeploying Firestore indexes...');
try {
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  console.log('\nFirestore indexes deployed successfully!');
} catch (error) {
  console.error('\nError deploying Firestore indexes:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure you have the Firebase CLI installed (npm install -g firebase-tools)');
  console.log('2. Make sure you are logged in to Firebase (firebase login)');
  console.log('3. Make sure you have selected the correct project (firebase use <project-id>)');
  console.log('4. Check the Firebase console for more details on any errors');
  process.exit(1);
} 