// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

// In production, log environment variable status
if (import.meta.env.PROD) {
  logEnvStatus();
}

// Firebase configuration with fallbacks for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCj5t-3Ch_9hqZWXLfWbR9pjHn5hkOV3vY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hopecare-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hopecare-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hopecare-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '808667296406',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:808667296406:web:f07e7291437103cfdf08b7',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3CR0LRE3QF'
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
    }
  }).catch(error => {
    console.warn('Firebase Analytics not supported:', error);
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  
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