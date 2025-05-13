# HopeCare: Supabase to Firebase Migration Guide

This guide provides detailed instructions for migrating the HopeCare application from Supabase to Firebase. It covers authentication, database, and storage migration, along with testing procedures and rollback options.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup and Configuration](#setup-and-configuration)
3. [Migration Process](#migration-process)
   - [Testing Firebase Setup](#testing-firebase-setup)
   - [Migrating Authentication](#migrating-authentication)
   - [Migrating Database](#migrating-database)
   - [Verifying Migration](#verifying-migration)
4. [Code Updates](#code-updates)
5. [Testing](#testing)
6. [Rollback Procedures](#rollback-procedures)
7. [Post-Migration Tasks](#post-migration-tasks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration, ensure you have:

1. Created a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enabled Authentication in the Firebase console with Email/Password authentication
3. Created a Firestore database in the Firebase console
4. Generated a Firebase Admin SDK service account key
5. Backed up all Supabase data

## Setup and Configuration

1. Install required dependencies:
   ```bash
   npm install firebase firebase-admin
   ```

2. Add Firebase configuration to your `.env` file:
   ```
   # Firebase Client SDK
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_CERT_URL=your-client-cert-url
   ```

3. Ensure Supabase credentials are still available in the `.env` file for migration:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```

## Migration Process

### Testing Firebase Setup

Before migrating data, test your Firebase configuration:

```bash
npm run test:firebase
```

This script will:
- Verify your Firebase credentials
- Test authentication by creating and deleting a test user
- Test Firestore by creating, reading, updating, and deleting a test document
- Check for required collections

### Migrating Authentication

1. Migrate user accounts from Supabase to Firebase:

   ```bash
   npm run migrate:users
   ```

   This script:
   - Fetches all users from Supabase
   - Creates corresponding users in Firebase Authentication
   - Creates user profiles in Firestore
   - Migrates related profiles (donor, volunteer)

   **Note**: Since we can't migrate password hashes directly, users will need to reset their passwords. The script sets a temporary password and marks accounts for password reset.

2. For specific users (e.g., test accounts), you can use:

   ```bash
   npm run migrate:specific users email john.doe@example.com
   ```

### Migrating Database

1. Migrate essential tables:

   ```bash
   npm run migrate:all
   ```

   This will migrate:
   - User accounts
   - Donor profiles
   - Volunteer profiles
   - Donations

2. For other tables, migrate them individually:

   ```bash
   npm run migrate:db projects
   npm run migrate:db events
   npm run migrate:db blog_posts
   ```

3. For specific records or filtered data:

   ```bash
   npm run migrate:specific donations donor_id 123e4567-e89b-12d3-a456-426614174000
   ```

### Verifying Migration

After migration, verify that data has been correctly transferred:

```bash
npm run verify:migration users
npm run verify:migration donor_profiles
npm run verify:migration donations
```

This will:
- Compare record counts between Supabase and Firebase
- Check for missing or extra records
- Compare sample records to ensure data integrity

## Code Updates

The migration involves updating components to use Firebase instead of Supabase:

1. **Authentication**: Change imports from `useAuth` to `useFirebaseAuth`

   ```typescript
   // From:
   import { useAuth } from '../context/AuthContext';
   
   // To:
   import { useFirebaseAuth } from '../context/FirebaseAuthContext';
   ```

2. **Database Queries**: Use the Firestore utility functions

   ```typescript
   // From (Supabase):
   const { data, error } = await supabase
     .from('users')
     .select('id, name, email')
     .eq('role', 'DONOR')
     .order('created_at', { ascending: false })
     .limit(10);
   
   // To (Firebase):
   const { data, error } = await firestoreUtils.getAll('users', {
     select: ['id', 'name', 'email'],
     where: [['role', '==', 'DONOR']],
     orderBy: [['created_at', 'desc']],
     limit: 10
   });
   ```

3. **Provider**: Update the main `App.tsx` to use the Firebase auth provider

   ```tsx
   // From:
   import { AuthProvider } from './context/AuthContext';
   
   function App() {
     return (
       <AuthProvider>
         {/* Your app components */}
       </AuthProvider>
     );
   }
   
   // To:
   import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
   
   function App() {
     return (
       <FirebaseAuthProvider>
         {/* Your app components */}
       </FirebaseAuthProvider>
     );
   }
   ```

## Testing

1. Test the Firebase authentication with the test page:

   ```
   http://localhost:5173/firebase-auth-test
   ```

2. Test all authentication flows:
   - Login
   - Registration
   - Password reset
   - Social authentication (if applicable)

3. Test database operations:
   - Creating records
   - Reading records
   - Updating records
   - Deleting records

## Rollback Procedures

If issues arise during migration:

1. **Authentication Rollback**:
   - Keep both authentication systems running in parallel
   - Revert to using the Supabase `AuthProvider` in `App.tsx`
   - Revert component imports from `useFirebaseAuth` to `useAuth`

2. **Database Rollback**:
   - Revert database queries to use Supabase instead of Firestore
   - If data was modified in Firebase but not in Supabase, you may need to export from Firebase and import to Supabase

3. **Complete Rollback**:
   - Revert all code changes related to Firebase
   - Remove Firebase dependencies if no longer needed

## Post-Migration Tasks

After successful migration:

1. Notify users about the migration and password reset requirement
2. Monitor application performance and error rates
3. Update documentation to reflect the new authentication system
4. Clean up Supabase resources when no longer needed
5. Remove Supabase-related code and dependencies

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check Firebase Authentication console for user status
   - Verify email verification settings
   - Check for password reset requirements

2. **Database Access Issues**:
   - Verify Firestore security rules
   - Check collection and document paths
   - Ensure correct field types and formats

3. **Missing Data**:
   - Run verification scripts to identify missing records
   - Check migration logs for errors
   - Re-run specific migrations as needed

4. **Performance Issues**:
   - Review Firestore indexing
   - Check query patterns for inefficiencies
   - Consider caching strategies for frequently accessed data

### Getting Help

If you encounter issues not covered in this guide:

1. Check Firebase documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
2. Review Firebase error codes: [https://firebase.google.com/docs/auth/admin/errors](https://firebase.google.com/docs/auth/admin/errors)
3. Search for solutions on Stack Overflow with the `firebase` tag
4. Contact the development team for assistance

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Set up Firebase project
- [ ] Configure environment variables
- [ ] Test Firebase setup
- [ ] Migrate user accounts
- [ ] Migrate donor profiles
- [ ] Migrate volunteer profiles
- [ ] Migrate donations
- [ ] Migrate other collections
- [ ] Verify data migration
- [ ] Update authentication code
- [ ] Update database queries
- [ ] Test all functionality
- [ ] Deploy to production
- [ ] Notify users
- [ ] Monitor for issues
- [ ] Clean up Supabase resources 