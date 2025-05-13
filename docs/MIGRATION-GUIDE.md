# Supabase to Firebase Migration Guide

This guide outlines the process for migrating from Supabase to Firebase in the HopeCare application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Steps](#migration-steps)
3. [Schema Migration](#schema-migration)
4. [Data Migration](#data-migration)
5. [Code Updates](#code-updates)
6. [Testing](#testing)
7. [Cleanup](#cleanup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration, ensure you have:

- Firebase project set up with Firestore and Authentication enabled
- Firebase Admin SDK credentials configured in your `.env` file
- Node.js v16+ installed
- All migration scripts updated to use ES modules

Required environment variables for Firebase:

```
# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxx%40your-project-id.iam.gserviceaccount.com
```

## Migration Steps

The migration process consists of the following steps:

1. Test Firebase setup
2. Migrate database schema
3. Migrate user accounts
4. Migrate database tables
5. Verify migration
6. Update application code
7. Clean up Supabase references

### 1. Test Firebase Setup

Run the following command to test your Firebase configuration:

```bash
npm run test:firebase
```

This will verify that your Firebase credentials are correct and that you can connect to Firebase services.

### 2. Migrate Database Schema

Run the schema migration script to create the necessary collections in Firestore:

```bash
npm run migrate:schema
```

This script will:
- Create Firestore collections based on Supabase tables
- Generate Firestore security rules
- Save the schema information in a special `_schema` collection

### 3. Migrate User Accounts

Migrate user accounts from Supabase to Firebase Authentication:

```bash
npm run migrate:users
```

This script will:
- Fetch all users from Supabase
- Create corresponding users in Firebase Authentication
- Create user documents in Firestore
- Migrate user profiles (donor or volunteer)

### 4. Migrate Database Tables

Migrate data from Supabase tables to Firestore collections:

```bash
npm run migrate:db donor_profiles
npm run migrate:db volunteer_profiles
npm run migrate:db donations
```

Or migrate all tables at once:

```bash
npm run migrate:all
```

For specific data migration (e.g., filtering by a field):

```bash
npm run migrate:specific donations donor_id your-donor-id
```

### 5. Verify Migration

Verify that the data has been correctly migrated:

```bash
npm run verify:migration users
npm run verify:migration donor_profiles
npm run verify:migration volunteer_profiles
npm run verify:migration donations
```

## Schema Migration

The schema migration script (`migrate-schema.js`) converts Supabase tables to Firestore collections:

| Supabase Table | Firestore Collection |
|----------------|----------------------|
| users          | users                |
| donor_profiles | donor_profiles       |
| volunteer_profiles | volunteer_profiles |
| donations      | donations            |
| analytics_events | analytics_events   |
| logs           | logs                 |

## Data Migration

The data migration scripts handle the following:

1. `migrate-users.js`: Migrates user accounts and profiles
2. `migrate-database.js`: Migrates specific tables
3. `migrate-specific-data.js`: Migrates filtered data

## Code Updates

After migrating the data, you need to update your application code to use Firebase instead of Supabase:

1. Replace Supabase authentication with Firebase Authentication
2. Replace Supabase database queries with Firestore queries
3. Update any Supabase-specific features to use Firebase equivalents

Example of replacing Supabase auth with Firebase auth:

```typescript
// Old Supabase code
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// New Firebase code
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;
```

Example of replacing Supabase database queries with Firestore:

```typescript
// Old Supabase code
const { data, error } = await supabase
  .from('donations')
  .select('*')
  .eq('user_id', userId);

// New Firebase code
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const donationsRef = collection(db, 'donations');
const q = query(donationsRef, where('user_id', '==', userId));
const querySnapshot = await getDocs(q);
const donations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

## Testing

After migration, thoroughly test your application:

1. Test authentication (login, registration, password reset)
2. Test data retrieval and updates
3. Test specific features that used Supabase

## Cleanup

Once you've verified that everything works with Firebase, you can clean up Supabase references:

```bash
npm run cleanup:supabase
```

This script will:
- Find and list files with Supabase references
- Delete the Supabase folder
- Remove Supabase environment variables
- Remove Supabase dependencies from package.json

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Check that user accounts were migrated correctly
   - Verify Firebase Authentication configuration

2. **Missing Data**
   - Run verification scripts to identify missing data
   - Check Firestore security rules

3. **Security Rules**
   - Review the generated Firestore security rules
   - Test access patterns with the Firebase Emulator

### Logs

Check migration logs for errors:

```bash
grep -r "Error" logs/migration-*.log
```

### Rollback Plan

If you need to rollback to Supabase:

1. Keep Supabase project active during migration
2. Maintain a backup of your Supabase data
3. Revert code changes that replaced Supabase with Firebase

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Guide](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started) 