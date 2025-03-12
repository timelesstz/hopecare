/**
 * Utility module for loading the Firebase service account
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load the Firebase service account from file or environment variables
 * @returns {Object} The service account object
 */
export function loadServiceAccount() {
  // Check if we have a service account file
  const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
  let serviceAccount;

  if (fs.existsSync(serviceAccountPath)) {
    console.log('Using service account file');
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountFile);
    
    console.log(`Service account loaded for project: ${serviceAccount.project_id}`);
  } else {
    console.log('Using environment variables for service account');
    // Firebase Admin SDK configuration from environment variables
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };
  }

  return serviceAccount;
}

export default loadServiceAccount;

 