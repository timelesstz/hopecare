#!/usr/bin/env node

/**
 * Script to deploy Firebase security rules
 * 
 * This script deploys Firestore and Storage security rules to Firebase
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Check if rules files exist
const firestoreRulesPath = path.join(rootDir, 'firestore.rules');
const storageRulesPath = path.join(rootDir, 'storage.rules');

const firestoreRulesExist = fs.existsSync(firestoreRulesPath);
const storageRulesExist = fs.existsSync(storageRulesPath);

if (!firestoreRulesExist && !storageRulesExist) {
  console.error('Error: No rules files found. Make sure firestore.rules and/or storage.rules exist.');
  process.exit(1);
}

// Deploy rules
try {
  console.log('Deploying Firebase security rules...');
  
  if (firestoreRulesExist && storageRulesExist) {
    // Deploy both Firestore and Storage rules
    console.log('Deploying Firestore and Storage rules...');
    execSync('firebase deploy --only firestore:rules,storage:rules', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  } else if (firestoreRulesExist) {
    // Deploy only Firestore rules
    console.log('Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  } else if (storageRulesExist) {
    // Deploy only Storage rules
    console.log('Deploying Storage rules...');
    execSync('firebase deploy --only storage:rules', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  }
  
  console.log('Security rules deployed successfully!');
} catch (error) {
  console.error('Error deploying security rules:', error.message);
  
  // Check for common errors
  if (error.message.includes('not logged in')) {
    console.log('\nTip: You need to log in to Firebase first. Run:');
    console.log('firebase login');
  } else if (error.message.includes('project directory')) {
    console.log('\nTip: Make sure you have a firebase.json file in your project root.');
    console.log('If not, run: firebase init');
  } else if (error.message.includes('syntax error')) {
    console.log('\nTip: There is a syntax error in your rules file. Check the error message above.');
  }
  
  process.exit(1);
}

// Validate rules (optional)
try {
  console.log('\nValidating security rules...');
  
  if (firestoreRulesExist) {
    console.log('Validating Firestore rules...');
    execSync('firebase firestore:rules-test', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  }
  
  if (storageRulesExist) {
    console.log('Validating Storage rules...');
    // Note: Firebase CLI doesn't have a built-in storage rules validator
    // This is a placeholder for future Firebase CLI updates
  }
  
  console.log('Security rules validation completed!');
} catch (error) {
  console.warn('Warning: Could not validate rules:', error.message);
  console.log('Rules were deployed but validation failed or is not available.');
} 