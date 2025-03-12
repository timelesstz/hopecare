// Firebase configuration
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Environment variables should be properly set up in .env files
// NEVER hardcode API keys in the source code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if environment variables are properly set
const missingEnvVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing Firebase configuration: ${missingEnvVars.join(', ')}. ` +
    `Please check your environment variables.`
  );
}

// Initialize Firebase with proper error handling
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Analytics conditionally
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(error => {
    console.warn('Firebase Analytics initialization error:', error);
  });
  
  if (import.meta.env.DEV) {
    console.log('Firebase initialized successfully in development mode');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  
  // Create dummy implementations for Firebase services in case of initialization failure
  // This allows the app to continue running in a degraded state
  const dummyApp = {} as unknown;
  app = dummyApp as FirebaseApp;
  
  const dummyAuth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    signOut: () => Promise.reject(new Error('Firebase not initialized'))
  } as unknown;
  auth = dummyAuth as Auth;
  
  const dummyDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firebase not initialized')),
        set: () => Promise.reject(new Error('Firebase not initialized')),
        update: () => Promise.reject(new Error('Firebase not initialized')),
        delete: () => Promise.reject(new Error('Firebase not initialized'))
      })
    })
  } as unknown;
  db = dummyDb as Firestore;
  
  const dummyStorage = {
    ref: () => ({
      put: () => Promise.reject(new Error('Firebase not initialized')),
      getDownloadURL: () => Promise.reject(new Error('Firebase not initialized'))
    })
  } as unknown;
  storage = dummyStorage as FirebaseStorage;
}

export { app, auth, db, storage, analytics };