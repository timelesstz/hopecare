// Script to update Firebase configuration in .env file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// New Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj5t-3Ch_9hqZWXLfWbR9pjHn5hkOV3vY",
  authDomain: "hopecare-app.firebaseapp.com",
  projectId: "hopecare-app",
  storageBucket: "hopecare-app.firebasestorage.app",
  messagingSenderId: "808667296406",
  appId: "1:808667296406:web:f07e7291437103cfdf08b7"
};

// Service account details
const serviceAccount = {
  project_id: "hopecare-app",
  private_key_id: "ea2b8de77512bf8209dccda9343aa94e268e9183",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBKS1SD/5jZKmJ\\nlvlB4CtnIrKUS0MlIqAMmUrBps/Yf7d6YfkMmuMuFoT44uiT0NpMhFhyo7YfR8h4\\n4wx+Y5R7uok+OxuuI+mVkXmpq3HF0MUwC0dpT5emcpedRm5eG5qKGB5ucpJ+Nq/j\\nfSVeZxXhzmiyMCXDc+lQ97IRbvaSYy9GpA5lH67TyVxx8Vud744xbTJYayc+I7zF\\n+vSSxPkpBjK5kZ5OEqxMid0C0AbKMhuAwHSZAhBVWm7hjVpk5JXPSZiJRhPLrAMT\\nXrNoKoBilYj2VHIBpMgb73fSeys8X4sc5jD4xF+YpyOdt6iTvE3pKD/r66ytrDxe\\n627RAd1jAgMBAAECggEAM1jsXMO2pppUPSiegwYB061UFnq5Uy5UqHS5fCgJWW5+\\nCjDwIQsteAtxdq3vEJg056FI19SwLbmJz6Tfpdt31bo9EIdq8MxIJEPjORjDqke4\\nm3BsH9ESKaONrTfTT/37g1ktAcRAL//+mrUiUWmK1hdmGnQVHdN6wtTNh7fdIQV4\\npZVZNuc5Q1JgHBCokC2dcUhlA4cJu4u9rSBnJvfyqncEUbKF4PdcZ0MfnxXzFYGu\\n8pZymPJvmgRBQc3hmK+vlq+3PqraUZVYD1qJdeMjxnrQ1Rny9khMquTEKGyrOrqD\\n9HDQBVcPuy/AkTKudcsit5y6BxFgFRlLh4V6/3JTFQKBgQD7cLo6g67XUooCL0R/\\nrleu/RNTFf7upW4LQhF8k4bSVMzq9jVXxlx7qO3olH29PZPqpUhczqcVC65Kza8a\\nHnlKhJ6c9JRdArhRnTw4h94wqUh6GzQZfGbcX3FA8YUesMJJ2bC14HmeeGnH5hO6\\nar4fH9NLCOBWdWZGcgauRGBdNQKBgQDEqeVoV7mXfrmvaJVD5tyy9972i0UX2yET\\n1Kgy9tfprd5TGqfGUEQPUUpQXwukHK+kJ1LW9b2Ja8BEstD/g/Z7zM//yQFQcjcf\\nxSNfKdmRL56jIcQV5GvsNCTTuZM58CpA0KOwp2/oik4CwBQkdsbZuyrNq5p5PLZ7\\nVtzag/xbNwKBgQCBvTDacIgO4rADYJBfsX3c9Qi7nmXkjceyV2zecuDmNotl0ZTE\\nrb2asRfRIo2ez986+/3SpW7hFR3hyy/GsmKzaKrPIgRL2dNxiUhBgxnK0g5rsw22\\n+NG6dCTj9btSkrItmP3tWt5mPouWcclMLzfap3lHBlV7Ryh2wO9hjDaM4QKBgD5I\\nG+nulk0fCgk+Er99VnmrPEZSFuCWOiSAnX/+YqSTtqwU7ftFIjjDoshPQW2I1Csl\\ndPu0uYDSygI3qy6wiRft5hV4f90NPt3l3ezeYRO0xAWfxOy1+WPFo8AVrkWUBJ2g\\nNabVcAByBICkefyOTS1ZNBYMeZBZpOTsvmbJk9sDAoGBAOKc9GN+JjzUsasy1CiN\\nZrr1E0ETWZngsFAeKyPjHJmT7c0ysIXlyVACKYWBjtIqGxJJQ6I7RjApN/E5+kz4\\n9b66kBxD1rT1t/TJDf7rC4X9pomGO2y3MpoqReFV2+beQIkegwzVyeB7wDgSWnn3\\nDtR6OMqsBUSpqLirxEAZdatU\\n-----END PRIVATE KEY-----\\n",
  client_email: "firebase-adminsdk-fbsvc@hopecare-app.iam.gserviceaccount.com",
  client_id: "113428546423971035879",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hopecare-app.iam.gserviceaccount.com"
};

// Read the .env file
const envPath = path.resolve(__dirname, '.env');
const envExamplePath = path.resolve(__dirname, '.env.example');

try {
  // Update .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update Firebase Client SDK Configuration
  envContent = envContent.replace(/VITE_FIREBASE_API_KEY=.*/g, `VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}`);
  envContent = envContent.replace(/VITE_FIREBASE_AUTH_DOMAIN=.*/g, `VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}`);
  envContent = envContent.replace(/VITE_FIREBASE_PROJECT_ID=.*/g, `VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}`);
  envContent = envContent.replace(/VITE_FIREBASE_STORAGE_BUCKET=.*/g, `VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}`);
  envContent = envContent.replace(/VITE_FIREBASE_MESSAGING_SENDER_ID=.*/g, `VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}`);
  envContent = envContent.replace(/VITE_FIREBASE_APP_ID=.*/g, `VITE_FIREBASE_APP_ID=${firebaseConfig.appId}`);
  
  // Update Firebase Admin SDK Configuration
  envContent = envContent.replace(/FIREBASE_PROJECT_ID=.*/g, `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  envContent = envContent.replace(/FIREBASE_PRIVATE_KEY_ID=.*/g, `FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  envContent = envContent.replace(/FIREBASE_PRIVATE_KEY=.*/g, `FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  envContent = envContent.replace(/FIREBASE_CLIENT_EMAIL=.*/g, `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  envContent = envContent.replace(/FIREBASE_CLIENT_ID=.*/g, `FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  envContent = envContent.replace(/FIREBASE_CLIENT_CERT_URL=.*/g, `FIREBASE_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, envContent);
  console.log('.env file updated successfully!');
  
  // Update .env.example file
  let envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Update Firebase Client SDK Configuration in .env.example
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_API_KEY=.*/g, `VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}`);
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_AUTH_DOMAIN=.*/g, `VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}`);
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_PROJECT_ID=.*/g, `VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}`);
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_STORAGE_BUCKET=.*/g, `VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}`);
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_MESSAGING_SENDER_ID=.*/g, `VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}`);
  envExampleContent = envExampleContent.replace(/VITE_FIREBASE_APP_ID=.*/g, `VITE_FIREBASE_APP_ID=${firebaseConfig.appId}`);
  
  // Update Firebase Admin SDK Configuration in .env.example
  envExampleContent = envExampleContent.replace(/FIREBASE_PROJECT_ID=.*/g, `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  envExampleContent = envExampleContent.replace(/FIREBASE_PRIVATE_KEY_ID=.*/g, `FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  envExampleContent = envExampleContent.replace(/FIREBASE_PRIVATE_KEY=.*/g, `FIREBASE_PRIVATE_KEY=${serviceAccount.private_key}`);
  envExampleContent = envExampleContent.replace(/FIREBASE_CLIENT_EMAIL=.*/g, `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  envExampleContent = envExampleContent.replace(/FIREBASE_CLIENT_ID=.*/g, `FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  envExampleContent = envExampleContent.replace(/FIREBASE_CLIENT_CERT_URL=.*/g, `FIREBASE_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  
  // Write the updated content back to the .env.example file
  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('.env.example file updated successfully!');
  
} catch (error) {
  console.error('Error updating environment files:', error);
} 