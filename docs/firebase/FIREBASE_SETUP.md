# Firebase Setup Instructions

## Prerequisites

1. **Firebase Account**: You need a Google account with access to Firebase.
2. **Firebase Project**: Create a new Firebase project or use an existing one.

## Step 1: Enable Firebase Services

Before you can use Firebase services, you need to enable them in the Firebase console.

1. **Enable Firebase Authentication**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to "Authentication" in the left sidebar
   - Click "Get Started"
   - Enable the sign-in methods you want to use (Email/Password, Google, etc.)

2. **Enable Firestore Database**:
   - Navigate to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in production mode" or "Start in test mode" (for development)
   - Select a location for your database
   - Click "Enable"

3. **Enable Firebase Storage**:
   - Navigate to "Storage" in the left sidebar
   - Click "Get Started"
   - Choose "Start in production mode" or "Start in test mode" (for development)
   - Select a location for your storage
   - Click "Done"

## Step 2: Set Up Firebase Admin SDK

To use Firebase Admin SDK in your application, you need to set up service account credentials.

1. **Generate Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to "Project settings" (gear icon)
   - Go to "Service accounts" tab
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Set Environment Variables**:
   - Add the following environment variables to your `.env` file:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY_ID=your-private-key-id
     FIREBASE_PRIVATE_KEY="your-private-key"
     FIREBASE_CLIENT_EMAIL=your-client-email
     FIREBASE_CLIENT_ID=your-client-id
     FIREBASE_CLIENT_CERT_URL=your-client-cert-url
     ```

## Step 3: Set Up Firebase Web SDK

To use Firebase in your web application, you need to set up the Firebase Web SDK.

1. **Get Firebase Configuration**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to "Project settings" (gear icon)
   - Scroll down to "Your apps" section
   - Click on the web app or create a new one
   - Copy the Firebase configuration object

2. **Set Environment Variables**:
   - Add the following environment variables to your `.env` file:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

## Step 4: Deploy Firebase Security Rules

To secure your Firebase data, you need to deploy security rules for Firestore and Storage.

1. **Deploy Firestore Security Rules**:
   - Run the following command:
     ```
     npm run deploy:firestore-rules
     ```

2. **Deploy Storage Security Rules**:
   - Run the following command:
     ```
     npm run deploy:storage-rules
     ```

## Step 5: Run Migration Scripts

To migrate your data from Supabase to Firebase, you need to run the migration scripts.

1. **Set Up Test Environment**:
   - Run the following command:
     ```
     npm run setup:test-env
     ```

2. **Migrate Users**:
   - Run the following command:
     ```
     npm run migrate:users
     ```

3. **Migrate Database**:
   - Run the following command:
     ```
     npm run migrate:all
     ```

4. **Verify Migration**:
   - Run the following command:
     ```
     npm run verify:migration
     ```

## Step 6: Clean Up

After the migration is complete, you can clean up the Supabase references.

1. **Run Final Cleanup**:
   - Run the following command:
     ```
     npm run cleanup:final
     ```

## Troubleshooting

### Error: Cloud Firestore API has not been used in project

If you see this error, you need to enable the Firestore API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Cloud Firestore API"
5. Click on it and click "Enable"
6. Wait a few minutes for the changes to propagate

### Error: Firebase Storage API has not been used in project

If you see this error, you need to enable the Firebase Storage API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Firebase Storage API"
5. Click on it and click "Enable"
6. Wait a few minutes for the changes to propagate 