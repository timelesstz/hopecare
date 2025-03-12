/**
 * Tests for Firebase Security Rules
 * 
 * Run with: npm run test:rules
 */

const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'hope-care-4c78c';
const FIRESTORE_RULES_PATH = path.join(__dirname, '../firestore.rules');
const STORAGE_RULES_PATH = path.join(__dirname, '../storage.rules');

/**
 * Creates a test Firestore app with the specified auth state
 */
function getFirestoreApp(auth) {
  return firebase.initializeTestApp({
    projectId: PROJECT_ID,
    auth
  }).firestore();
}

/**
 * Creates a test Storage app with the specified auth state
 */
function getStorageApp(auth) {
  return firebase.initializeTestApp({
    projectId: PROJECT_ID,
    auth
  }).storage();
}

/**
 * Creates an admin Firestore app
 */
function getAdminFirestoreApp() {
  return firebase.initializeAdminApp({
    projectId: PROJECT_ID
  }).firestore();
}

describe('Firestore Security Rules', () => {
  let adminDb;

  before(async () => {
    // Load the rules file
    const rules = fs.readFileSync(FIRESTORE_RULES_PATH, 'utf8');
    
    // Deploy the rules to the emulator
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules
    });
    
    // Initialize the admin app
    adminDb = getAdminFirestoreApp();
    
    // Set up test data
    const usersRef = adminDb.collection('users');
    await usersRef.doc('admin1').set({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    
    await usersRef.doc('donor1').set({
      email: 'donor@example.com',
      name: 'Donor User',
      role: 'DONOR',
      status: 'ACTIVE'
    });
    
    await usersRef.doc('volunteer1').set({
      email: 'volunteer@example.com',
      name: 'Volunteer User',
      role: 'VOLUNTEER',
      status: 'ACTIVE'
    });
    
    // Set up donor profiles
    await adminDb.collection('donor_profiles').doc('donor1').set({
      user_id: 'donor1',
      donation_total: 1000,
      donation_count: 5
    });
    
    // Set up volunteer profiles
    await adminDb.collection('volunteer_profiles').doc('volunteer1').set({
      user_id: 'volunteer1',
      skills: ['teaching', 'mentoring'],
      hours_total: 20
    });
    
    // Set up donations
    await adminDb.collection('donations').doc('donation1').set({
      donor_id: 'donor1',
      amount: 200,
      project_id: 'project1',
      status: 'completed'
    });
  });
  
  after(async () => {
    // Clean up
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  
  describe('Users Collection', () => {
    it('allows anyone to read user profiles', async () => {
      const db = getFirestoreApp(null); // Unauthenticated user
      await firebase.assertSucceeds(db.collection('users').doc('admin1').get());
    });
    
    it('allows users to read their own profile', async () => {
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertSucceeds(db.collection('users').doc('donor1').get());
    });
    
    it('allows users to update their own profile', async () => {
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertSucceeds(db.collection('users').doc('donor1').update({
        name: 'Updated Donor Name'
      }));
    });
    
    it('prevents users from updating other profiles', async () => {
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertFails(db.collection('users').doc('volunteer1').update({
        name: 'Hacked Name'
      }));
    });
    
    it('allows admins to update any profile', async () => {
      const db = getFirestoreApp({ uid: 'admin1', email: 'admin@example.com' });
      await firebase.assertSucceeds(db.collection('users').doc('volunteer1').update({
        name: 'Updated By Admin'
      }));
    });
  });
  
  describe('Donor Profiles', () => {
    it('allows donors to read their own profile', async () => {
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertSucceeds(db.collection('donor_profiles').doc('donor1').get());
    });
    
    it('prevents donors from reading other donor profiles', async () => {
      // Create another donor profile first
      await adminDb.collection('donor_profiles').doc('donor2').set({
        user_id: 'donor2',
        donation_total: 500
      });
      
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertFails(db.collection('donor_profiles').doc('donor2').get());
    });
    
    it('allows admins to read any donor profile', async () => {
      const db = getFirestoreApp({ uid: 'admin1', email: 'admin@example.com' });
      await firebase.assertSucceeds(db.collection('donor_profiles').doc('donor1').get());
    });
  });
  
  describe('Donations', () => {
    it('allows donors to read their own donations', async () => {
      const db = getFirestoreApp({ uid: 'donor1', email: 'donor@example.com' });
      await firebase.assertSucceeds(db.collection('donations').doc('donation1').get());
    });
    
    it('prevents volunteers from reading donations', async () => {
      const db = getFirestoreApp({ uid: 'volunteer1', email: 'volunteer@example.com' });
      await firebase.assertFails(db.collection('donations').doc('donation1').get());
    });
    
    it('allows admins to read all donations', async () => {
      const db = getFirestoreApp({ uid: 'admin1', email: 'admin@example.com' });
      await firebase.assertSucceeds(db.collection('donations').doc('donation1').get());
    });
  });
});

// Storage rules tests would be added here if Storage is set up
// describe('Storage Security Rules', () => { ... }); 