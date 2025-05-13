# HopeCare: Firebase to Supabase Migration Guide

This guide provides detailed instructions for migrating the HopeCare application from Firebase to Supabase. It covers authentication, database, and storage migration, along with testing procedures and rollback options.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup and Configuration](#setup-and-configuration)
3. [Migration Process](#migration-process)
   - [Testing Supabase Setup](#testing-supabase-setup)
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

1. Created a Supabase project at [https://app.supabase.com/](https://app.supabase.com/)
2. Enabled Authentication in the Supabase dashboard with Email/Password authentication
3. Generated a Supabase service role API key for migration scripts
4. Backed up all Firebase data
5. Installed the Supabase CLI for local development and migrations

## Setup and Configuration

1. Install required dependencies:
   ```bash
   npm install @supabase/supabase-js uuid
   ```

2. Add Supabase configuration to your `.env` file:
   ```
   # Supabase Client
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Supabase Service Role Key (for migration scripts)
   SUPABASE_SERVICE_KEY=your-service-role-key
   
   # Keep Firebase keys during migration
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Ensure Firebase credentials are still available in the `.env` file for migration:
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

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```

## Migration Process

### Testing Supabase Setup

Before migrating data, test your Supabase configuration:

```bash
npm run test:supabase
```

This script will:
- Verify your Supabase credentials
- Test authentication by creating and deleting a test user
- Test database operations by creating, reading, updating, and deleting a test record
- Check for required tables and RLS policies

### Migrating Authentication

1. Migrate user accounts from Firebase to Supabase:

   ```bash
   npm run migrate:users
   ```

   This script:
   - Fetches all users from Firebase Authentication
   - Creates corresponding users in Supabase Auth
   - Creates user profiles in Supabase database
   - Migrates related profiles (donor, volunteer, admin)

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

The migration involves updating components to use Supabase instead of Firebase:

1. **Authentication**: Change imports from `useFirebaseAuth` to `useSupabaseAuth`

   ```typescript
   // From:
   import { useFirebaseAuth } from '../context/FirebaseAuthContext';
   
   // To:
   import { useSupabaseAuth } from '../context/SupabaseAuthContext';
   ```

2. **Database Queries**: Use the Supabase client functions

   ```typescript
   // From (Firebase):
   const usersRef = collection(db, 'users');
   const q = query(usersRef, 
     where('role', '==', 'DONOR'),
     orderBy('created_at', 'desc'),
     limit(10)
   );
   const querySnapshot = await getDocs(q);
   const users = querySnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   }));
   
   // To (Supabase):
   const { data: users, error } = await supabase
     .from('users')
     .select('id, name, email')
     .eq('role', 'DONOR')
     .order('created_at', { ascending: false })
     .limit(10);
   ```

3. **Provider**: Update the main `App.tsx` to use the Supabase auth provider

   ```tsx
   // From:
   import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
   
   function App() {
     return (
       <FirebaseAuthProvider>
         {/* Your app components */}
       </FirebaseAuthProvider>
     );
   }
   
   // To:
   import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
   
   function App() {
     return (
       <SupabaseAuthProvider>
         {/* Your app components */}
       </SupabaseAuthProvider>
     );
   }
   ```

## Testing

1. Test the Supabase authentication with the test page:

   ```
   http://localhost:5173/supabase-auth-test
   ```

2. Test all authentication flows:
   - Login
   - Registration
   - Password reset
   - Social authentication (if applicable)

3. Test database operations with Supabase:
   - Creating records
   - Reading records with RLS policies
   - Updating records
   - Deleting records
   - Testing foreign key constraints

## Rollback Procedures

If issues arise during migration:

1. **Authentication Rollback**:
   - Keep both authentication systems running in parallel
   - Revert to using the Firebase `FirebaseAuthProvider` in `App.tsx`
   - Revert component imports from `useSupabaseAuth` to `useFirebaseAuth`

2. **Database Rollback**:
   - Revert database queries to use Firestore instead of Supabase
   - If data was modified in Supabase but not in Firebase, you may need to export from Supabase and import to Firebase

3. **Complete Rollback**:
   - Revert all code changes related to Supabase
   - Remove Supabase dependencies if no longer needed

## Post-Migration Tasks

After successful migration:

1. Notify users about the migration and password reset requirement
2. Monitor application performance and error rates
3. Update documentation to reflect the new Supabase authentication system
4. Clean up Firebase resources when no longer needed
5. Remove Firebase-related code and dependencies

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