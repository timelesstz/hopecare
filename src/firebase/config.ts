// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { env } from '../utils/envUtils';
import { handleError, ErrorType } from '../utils/errorUtils';

// Log environment variable status for debugging
const logEnvStatus = () => {
  const envVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ];
  
  console.log('Environment variables status:');
  envVars.forEach(varName => {
    console.log(`${varName}: ${import.meta.env[varName] ? 'Present' : 'Missing'}`);
  });
};

// In development, log environment variable status
if (env.isDevelopment()) {
  logEnvStatus();
}

// Firebase configuration using our environment utilities
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Analytics conditionally
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  }).catch(error => {
    handleError(error, ErrorType.UNKNOWN, {
      context: 'firebase-analytics-init',
      showToast: false,
      userMessage: 'Firebase Analytics initialization failed'
    });
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  handleError(error, ErrorType.UNKNOWN, {
    context: 'firebase-init',
    userMessage: 'Failed to initialize Firebase services'
  });
  
  // Create dummy implementations for Firebase services
  app = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    signOut: () => Promise.reject(new Error('Firebase not initialized'))
  } as any;
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firebase not initialized')),
        set: () => Promise.reject(new Error('Firebase not initialized')),
        update: () => Promise.reject(new Error('Firebase not initialized')),
        delete: () => Promise.reject(new Error('Firebase not initialized'))
      })
    })
  } as any;
  
  storage = {
    ref: () => ({
      put: () => Promise.reject(new Error('Firebase not initialized')),
      getDownloadURL: () => Promise.reject(new Error('Firebase not initialized'))
    })
  } as any;
}

export { app, auth, db, storage, analytics }; 