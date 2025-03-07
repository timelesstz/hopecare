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