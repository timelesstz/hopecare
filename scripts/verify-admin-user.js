import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Setup environment variables
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function verifyAdminUser() {
  try {
    console.log('Verifying admin user...');
    
    // Get user by email
    const email = 'admin@hopecaretz.org';
    const userRecord = await auth.getUserByEmail(email);
    
    console.log('User found:', userRecord.toJSON());
    
    // Check custom claims
    const customClaims = userRecord.customClaims || {};
    console.log('Custom claims:', customClaims);
    
    // Check if user has admin role in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      console.log('User document in Firestore:', userDoc.data());
    } else {
      console.log('User document not found in Firestore');
    }
    
    // Verify admin role
    if (customClaims.admin === true || (userDoc.exists && userDoc.data().role === 'ADMIN')) {
      console.log('✅ User has admin privileges');
    } else {
      console.log('❌ User does not have admin privileges');
      
      // Set admin custom claim if needed
      if (!customClaims.admin) {
        console.log('Setting admin custom claim...');
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log('✅ Admin custom claim set successfully');
      }
      
      // Update user role in Firestore if needed
      if (userDoc.exists && userDoc.data().role !== 'ADMIN') {
        console.log('Updating user role in Firestore...');
        await db.collection('users').doc(userRecord.uid).update({ role: 'ADMIN' });
        console.log('✅ User role updated to ADMIN in Firestore');
      } else if (!userDoc.exists) {
        console.log('Creating user document in Firestore...');
        await db.collection('users').doc(userRecord.uid).set({
          email: userRecord.email,
          name: userRecord.displayName || 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('✅ User document created in Firestore');
      }
    }
  } catch (error) {
    console.error('Error verifying admin user:', error);
  }
}

verifyAdminUser()
  .then(() => {
    console.log('Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  }); 