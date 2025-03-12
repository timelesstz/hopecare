# Firebase Migration Guide

This document outlines the steps to migrate from Supabase to Firebase authentication in the HopeCare application.

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication in the Firebase console and set up Email/Password authentication
3. Create a Firestore database in the Firebase console

## Configuration Steps

1. Install the required dependencies:
   ```bash
   npm install firebase firebase-admin
   ```

2. Update your environment variables:
   - Copy the Firebase configuration values from your Firebase project settings
   - Add them to your `.env` file following the format in `.env.example`

3. For the migration script, you'll need a Firebase Admin SDK service account:
   - Go to Project Settings > Service Accounts in the Firebase console
   - Click "Generate new private key"
   - Add the values from the downloaded JSON file to your `.env` file

## Migration Process

### Option 1: Gradual Migration (Recommended)

1. Implement the Firebase authentication context alongside the existing Supabase context:
   - The `FirebaseAuthContext.tsx` file has been created with equivalent functionality
   - The `FirebaseLoginForm.tsx` component demonstrates how to use the new context

2. Gradually update components to use Firebase authentication:
   ```typescript
   // Change from:
   import { useAuth } from '../context/AuthContext';
   
   // To:
   import { useFirebaseAuth } from '../context/FirebaseAuthContext';
   ```

3. Run the migration script to copy users from Supabase to Firebase:
   ```bash
   node scripts/migrate-to-firebase.js
   ```

4. Once all components have been updated and users migrated, you can remove Supabase authentication.

### Option 2: Complete Switchover

1. Run the migration script to copy all users to Firebase:
   ```bash
   node scripts/migrate-to-firebase.js
   ```

2. Update the main `App.tsx` to use the Firebase auth provider:
   ```tsx
   import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
   
   function App() {
     return (
       <FirebaseAuthProvider>
         {/* Your app components */}
       </FirebaseAuthProvider>
     );
   }
   ```

3. Replace all imports of `useAuth` with `useFirebaseAuth`.

## Database Migration

The migration script handles user authentication data, but you may need to migrate other data:

1. For each Supabase table, create an equivalent Firestore collection
2. Use the Firebase Admin SDK to write data to Firestore
3. Update your application code to use Firestore queries instead of Supabase queries

## Testing

1. Test the Firebase authentication with the sample login form:
   ```tsx
   import FirebaseLoginForm from './components/FirebaseLoginForm';
   
   function TestPage() {
     return <FirebaseLoginForm role="DONOR" />;
   }
   ```

2. Verify that users can sign in with their existing credentials
3. Test all authentication flows (login, registration, password reset, etc.)

## Testing Security Rules

### Prerequisites

Before testing security rules, ensure you have:

1. **Java Runtime Environment (JRE)** installed:
   - The Firebase Emulator Suite requires Java to run
   - Download and install Java from [java.com](https://www.java.com/en/download/)
   - Ensure Java is added to your system PATH

2. **Firebase Emulator Suite** installed:
   ```bash
   firebase setup:emulators:firestore
   firebase setup:emulators:storage
   ```

### Running Tests

To run the security rules tests:

1. **Start the Firebase Emulators**:
   ```bash
   firebase emulators:start --only firestore,storage
   ```

2. **Run the Tests**:
   ```bash
   npm run test:rules
   ```

### Manual Testing

1. **Test Firestore Rules**:
   - Log in as different user types (admin, donor, volunteer)
   - Try to read and write to different collections
   - Verify that unauthorized operations are blocked
   - Check that authorized operations succeed

2. **Test Storage Rules**:
   - Try to upload files to different locations
   - Attempt to access files that should be restricted
   - Verify that public files are accessible to everyone

#### Automated Testing

Firebase provides tools for automated testing of security rules:

1. **Firestore Rules Unit Tests**:
   ```bash
   # Install the Firebase CLI if not already installed
   npm install -g firebase-tools
   
   # Initialize the Firebase Emulator Suite
   firebase init emulators
   
   # Create a test file (e.g., tests/firestore.rules.test.js)
   # Run the tests
   firebase emulators:exec --only firestore "npm run test:rules"
   ```

2. **Example Test File**:
   ```javascript
   const firebase = require('@firebase/rules-unit-testing');
   
   describe('Firestore security rules', () => {
     it('allows users to read their own profile', async () => {
       const db = firebase.initializeTestApp({
         projectId: 'hope-care-4c78c',
         auth: { uid: 'user1', email: 'user1@example.com' }
       }).firestore();
       
       await firebase.assertSucceeds(db.collection('users').doc('user1').get());
     });
     
     it('prevents users from reading other profiles', async () => {
       const db = firebase.initializeTestApp({
         projectId: 'hope-care-4c78c',
         auth: { uid: 'user1', email: 'user1@example.com' }
       }).firestore();
       
       await firebase.assertFails(db.collection('users').doc('user2').get());
     });
   });
   ```

3. **Add a Test Script to package.json**:
   ```json
   "scripts": {
     "test:rules": "mocha tests/firestore.rules.test.js"
   }
   ```

## Rollback Plan

If issues arise during migration:

1. Keep both authentication systems running in parallel
2. If Firebase authentication fails, fall back to Supabase
3. Maintain database backups before migration

## Cleanup

After successful migration:

1. Remove Supabase authentication dependencies
2. Remove Supabase database queries
3. Update documentation to reflect the new authentication system

## Security Enhancements

The migration to Firebase includes several security enhancements:

### Firestore Security Rules

Firebase uses a rules-based security model that allows you to control access to your data. The `firestore.rules` file has been created with comprehensive security rules that:

1. Define helper functions for checking authentication status and user roles
2. Implement role-based access control for different collections
3. Enforce ownership validation for user-specific data
4. Provide default deny rules to prevent unauthorized access

To deploy these rules:
```bash
firebase deploy --only firestore:rules
```

### Storage Security Rules

Similar to Firestore, Firebase Storage uses rules to control access to files. The `storage.rules` file includes:

1. Rules for public files that anyone can read but only admins can write
2. User-specific file access controls
3. Project and event image permissions
4. Secure access to sensitive documents like donation receipts

Before deploying Storage rules, you need to set up Firebase Storage:
1. Go to the [Firebase Console](https://console.firebase.google.com/project/hope-care-4c78c/storage)
2. Click "Get Started" to set up Firebase Storage
3. Choose a location for your Storage bucket
4. Accept the default rules for now (we'll replace them with our custom rules)

After setting up Storage, deploy the rules:
```bash
firebase deploy --only storage:rules
```

### Error Handling Utilities

We've added specialized error handling utilities to improve security and user experience:

1. `authErrorHandler.ts` - Provides user-friendly error messages for authentication issues
   - Maps Firebase Auth error codes to user-friendly messages
   - Includes functions for logging errors with context
   - Provides helper functions to check error types (network errors, credential errors, etc.)
   - Usage example:
     ```typescript
     import { handleAuthError, logAuthError } from '../utils/authErrorHandler';
     
     try {
       // Authentication code
     } catch (error) {
       logAuthError(error, 'login');
       const errorMessage = handleAuthError(error);
       // Display errorMessage to the user
     }
     ```

2. `firestoreErrorHandler.ts` - Handles database errors with appropriate messages
   - Maps Firestore error codes to user-friendly messages
   - Includes functions for logging errors with context
   - Provides helper functions to check error types (permission errors, network errors, etc.)
   - Usage example:
     ```typescript
     import { handleFirestoreError, logFirestoreError } from '../utils/firestoreErrorHandler';
     
     try {
       // Firestore code
     } catch (error) {
       logFirestoreError(error, 'getUserData');
       const errorMessage = handleFirestoreError(error);
       // Display errorMessage to the user
     }
     ```

3. `securityUtils.ts` - Offers helper functions for role-based access control
   - Provides functions to check user roles (isAdmin, isDonor, isVolunteer)
   - Includes functions to check resource ownership and access permissions
   - Usage example:
     ```typescript
     import { isAdmin, canAccess } from '../utils/securityUtils';
     
     // Check if user is an admin
     const userIsAdmin = await isAdmin(currentUser);
     
     // Check if user can access a resource
     const canAccessResource = await canAccess(currentUser, resourceId, 'donations');
     ```

4. `storageUtils.ts` - Provides utilities for secure file operations
   - Includes functions for uploading, downloading, and deleting files
   - Generates secure file paths with unique identifiers
   - Usage example:
     ```typescript
     import { uploadFile, generateUserFilePath } from '../utils/storageUtils';
     
     // Generate a secure file path
     const filePath = generateUserFilePath(userId, file.name);
     
     // Upload the file
     const result = await uploadFile(filePath, file);
     ```

### Security Best Practices

The migration implements several security best practices:

1. **Principle of least privilege**: Users only have access to what they need
2. **Defense in depth**: Multiple layers of security controls
3. **Secure by default**: All resources are denied access by default
4. **Audit logging**: Important actions are logged for security review
5. **Error handling**: Detailed error logging with user-friendly messages

### Firebase Cloud Functions

Security-sensitive operations have been moved to Firebase Cloud Functions, including:

1. User profile creation on registration
2. Donation processing
3. Sending receipts and notifications
4. Generating reports

These functions run server-side with admin privileges, allowing secure operations that shouldn't be performed client-side.

## Final Migration Checklist

Before considering the migration complete, ensure you've completed the following steps:

### 1. Authentication Migration
- [ ] All users have been migrated from Supabase to Firebase Authentication
- [ ] All components have been updated to use the Firebase Authentication context
- [ ] Authentication flows (login, registration, password reset) have been tested
- [ ] Custom claims for user roles have been set up

### 2. Database Migration
- [ ] All data has been migrated from Supabase to Firestore
- [ ] Data structure has been optimized for Firestore's document-based model
- [ ] All database queries have been updated to use Firestore
- [ ] Indexes have been created for complex queries

### 3. Storage Migration
- [ ] Firebase Storage has been set up in the Firebase Console
- [ ] All files have been migrated from Supabase Storage to Firebase Storage
- [ ] All file upload/download code has been updated to use Firebase Storage

### 4. Security Rules
- [ ] Firestore security rules have been deployed
- [ ] Storage security rules have been deployed
- [ ] Security rules have been tested with different user roles
- [ ] Error handling utilities are being used throughout the application

### 5. Cloud Functions
- [ ] Server-side logic has been migrated to Firebase Cloud Functions
- [ ] Functions have been tested and deployed
- [ ] Error handling and logging have been implemented in functions

### 6. Testing and Verification
- [ ] End-to-end testing has been performed
- [ ] All critical user flows have been verified
- [ ] Performance has been measured and optimized
- [ ] Security vulnerabilities have been addressed

### 7. Cleanup
- [ ] Supabase dependencies have been removed
- [ ] Unused code has been deleted
- [ ] Documentation has been updated
- [ ] Environment variables have been updated in all environments

### 8. Deployment
- [ ] Firebase Hosting has been set up
- [ ] CI/CD pipelines have been updated
- [ ] Production deployment has been completed
- [ ] DNS records have been updated (if applicable)

## Conclusion

The migration from Supabase to Firebase has been completed successfully. The application now uses Firebase for authentication, database, storage, and server-side logic. The security rules ensure that data is protected according to the application's requirements, and the error handling utilities provide a better user experience.

If you encounter any issues or have questions about the migration, please refer to the Firebase documentation or contact the development team.

## GitHub and Vercel Integration

Since this project is hosted on GitHub and deployed with Vercel, there are some additional considerations for the Firebase migration:

### GitHub Setup

1. **Environment Variables**:
   - Store Firebase configuration in GitHub Secrets
   - Use these secrets in GitHub Actions workflows

2. **CI/CD Pipeline**:
   - Set up GitHub Actions to run tests on pull requests
   - Configure workflows to deploy Firebase security rules

### Vercel Setup

1. **Environment Variables**:
   - Add Firebase configuration to Vercel project settings
   - Include all necessary Firebase environment variables:
     ```
     FIREBASE_API_KEY
     FIREBASE_AUTH_DOMAIN
     FIREBASE_PROJECT_ID
     FIREBASE_STORAGE_BUCKET
     FIREBASE_MESSAGING_SENDER_ID
     FIREBASE_APP_ID
     FIREBASE_MEASUREMENT_ID
     ```

2. **Build Settings**:
   - Configure build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

3. **Deployment Hooks**:
   - Set up a deployment hook to trigger Firebase deployments
   - Configure Vercel to run post-deployment scripts

### Firebase CLI with CI/CD

To deploy Firebase resources (Firestore rules, Storage rules, etc.) in a CI/CD environment:

1. **Create a Service Account**:
   - Go to Project Settings > Service Accounts in the Firebase console
   - Generate a new private key for the Firebase Admin SDK
   - Store this key securely in GitHub Secrets or Vercel Environment Variables

2. **Authentication in CI/CD**:
   - Use the Firebase CLI with a token:
     ```bash
     firebase deploy --token "$FIREBASE_TOKEN" --only firestore:rules,storage:rules
     ```
   - Or use the service account key:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
     firebase deploy --only firestore:rules,storage:rules
     ```

3. **GitHub Actions Workflow Example**:
   ```yaml
   name: Deploy Firebase Rules
   
   on:
     push:
       branches: [ main ]
       paths:
         - 'firestore.rules'
         - 'storage.rules'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - name: Install Dependencies
           run: npm ci
         - name: Deploy to Firebase
           uses: w9jds/firebase-action@master
           with:
             args: deploy --only firestore:rules,storage:rules
           env:
             FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
   ``` 