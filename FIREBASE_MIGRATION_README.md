# Firebase Migration Guide

## Overview

This document provides instructions for setting up and using Firebase in the HopeCare application. The application has been fully migrated from Supabase to Firebase for authentication, database, and storage.

## Prerequisites

1. A Firebase project created at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Firebase Authentication enabled with Email/Password provider
3. Firestore Database created in Native mode
4. Firebase Storage bucket created

## Environment Variables

Create or update your `.env` file with the following Firebase configuration values:

```
# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (for migration scripts)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_client_cert_url
```

You can find the client SDK configuration values in the Firebase console under Project Settings > General > Your apps > SDK setup and configuration.

For the Admin SDK configuration, you need to generate a service account key from Project Settings > Service accounts > Generate new private key.

## Authentication

The application uses Firebase Authentication for user management. The authentication flow is handled by the `FirebaseAuthContext` provider in `src/context/FirebaseAuthContext.tsx`.

### User Roles

User roles are stored in two places:
1. In the Firestore `users` collection as a `role` field
2. As Firebase Auth custom claims for role-based access control

The supported roles are:
- `ADMIN`: Administrative users with full access
- `DONOR`: Donor users who can make donations and manage their profiles
- `VOLUNTEER`: Volunteer users who can sign up for events and manage their availability

### Protected Routes

Protected routes are implemented using the `FirebaseProtectedRoute` component in `src/components/auth/FirebaseProtectedRoute.tsx`. This component checks if the user is authenticated and has the required role before allowing access to the route.

## Database

The application uses Firestore for data storage. The database operations are handled by utility functions in `src/utils/firestoreUtils.ts`.

### Collections

The main collections in the Firestore database are:
- `users`: User profiles
- `donor_profiles`: Additional information for donor users
- `volunteer_profiles`: Additional information for volunteer users
- `donations`: Donation records
- `events`: Event information
- `blog_posts`: Blog content

## Migration Scripts

If you need to migrate data from Supabase to Firebase, the following scripts are available:

```bash
# Migrate users from Supabase to Firebase
npm run migrate:users

# Migrate specific data tables
npm run migrate:db donor_profiles
npm run migrate:db volunteer_profiles
npm run migrate:db donations

# Migrate all data
npm run migrate:all

# Migrate a specific collection with custom options
npm run migrate:specific

# Migrate schema definitions
npm run migrate:schema

# Verify migration success
npm run verify:migration

# Test Firebase setup
npm run test:firebase

# Clean up Supabase dependencies
npm run cleanup:supabase
```

## Testing

To test the Firebase authentication, you can use the test page at `/firebase-auth-test`. This page demonstrates the authentication flow and Firestore operations.

## Troubleshooting

### Authentication Issues

1. Check that Firebase Authentication is properly configured in the Firebase console
2. Verify that the environment variables are correctly set
3. Check the browser console for any authentication errors

### Database Issues

1. Check Firestore security rules in the Firebase console
2. Verify that the collections exist in the Firestore database
3. Check the browser console for any Firestore errors

## Security Rules

Firestore security rules are defined in the Firebase console. The basic rules should allow:
- Authenticated users to read and write their own data
- Admin users to read and write all data
- Public access to read-only data like blog posts and events

Example security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admin users to read and write all data
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.role == 'ADMIN';
    }
    
    // Allow public access to blog posts
    match /blog_posts/{postId} {
      allow read: if true;
    }
  }
}
```

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 