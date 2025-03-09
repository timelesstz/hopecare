# Firebase Migration Report

## Overview

This report outlines the current status of the Supabase to Firebase migration, identifies potential issues, and provides solutions to ensure a smooth transition. The migration involves moving authentication, database operations, and storage from Supabase to Firebase services.

## Migration Status

The migration is currently in progress with the following components implemented:

- ✅ Firebase client configuration (`src/lib/firebase.ts`)
- ✅ Firebase Authentication Context (`src/context/FirebaseAuthContext.tsx`)
- ✅ Firebase Login Component (`src/components/FirebaseLoginForm.tsx`)
- ✅ Firestore utility functions (`src/utils/firestoreUtils.ts`)
- ✅ Test page for Firebase authentication (`src/pages/FirebaseAuthTest.tsx`)
- ✅ Migration scripts for users and data (`scripts/migrate-to-firebase.js`, `scripts/migrate-specific-data.js`)
- ✅ Schema migration script (`scripts/migrate-schema.js`)
- ✅ Migration verification script (`scripts/verify-migration.js`)

## Issues Identified

### 1. Authentication Context Conflict

**Issue:** The application is currently using `AuthContext` from `src/contexts/AuthContext.tsx` but has implemented a new `FirebaseAuthContext` in `src/context/FirebaseContext.tsx`. However, the `App.tsx` still only wraps the application with the Supabase `AuthProvider`.

**Solution:**
```tsx
// Option 1: Parallel authentication during migration
<ErrorBoundary>
  <AuthProvider> {/* Supabase Auth */}
    <FirebaseAuthProvider> {/* Firebase Auth */}
      <ThemeProvider>
        {/* Rest of providers */}
      </ThemeProvider>
    </FirebaseAuthProvider>
  </AuthProvider>
</ErrorBoundary>

// Option 2: Complete switch to Firebase
<ErrorBoundary>
  <FirebaseAuthProvider>
    <ThemeProvider>
      {/* Rest of providers */}
    </ThemeProvider>
  </FirebaseAuthProvider>
</ErrorBoundary>
```

### 2. Protected Route Component Incompatibility

**Issue:** The `ProtectedRoute` component in `src/components/auth/ProtectedRoute.tsx` is importing from `../../contexts/AuthContext` (Supabase) but needs to work with Firebase Auth as well.

**Solution:**
- Create a new `FirebaseProtectedRoute` component or update the existing one to support both auth systems
- Update imports to use the correct context based on which auth system is active

### 3. Router Configuration Issues

**Issue:** The router in `src/router.tsx` is using the Supabase `useAuth` hook but needs to be updated to work with Firebase Auth.

**Solution:**
- Update the router to use the appropriate auth hook based on which system is active
- Ensure the role-based redirects work with Firebase's user structure

### 4. Missing Firebase Environment Variables

**Issue:** The Firebase initialization in `src/lib/firebase.ts` checks for only two environment variables (`VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_AUTH_DOMAIN`) but uses six in the configuration.

**Solution:**
```typescript
if (
  !import.meta.env.VITE_FIREBASE_API_KEY || 
  !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  !import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
  !import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  !import.meta.env.VITE_FIREBASE_APP_ID
) {
  console.error('Missing Firebase credentials. Please check your .env file.');
}
```

### 5. Migration Script Private Key Format Issue

**Issue:** In `scripts/migrate-to-firebase.js`, the Firebase private key is processed with `replace(/\\n/g, '\n')`, but this might not work correctly depending on how the key is stored in environment variables.

**Solution:**
```javascript
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedPrivateKey = privateKey.startsWith('"') 
  ? JSON.parse(privateKey) 
  : privateKey.replace(/\\n/g, '\n');
```

### 6. User Role Structure Differences

**Issue:** Supabase stores user roles in `user.user_metadata.role` while Firebase stores them in the Firestore user document as `user.role`.

**Solution:**
- Update the `FirebaseAuthContext` to standardize the user object structure to match Supabase's format
- Or update components that rely on the role structure to check both locations

### 7. Missing Error Handling in Firestore Utilities

**Issue:** Some of the Firestore utility functions in `src/utils/firestoreUtils.ts` have basic error handling but could be improved.

**Solution:**
- Add more specific error handling for different types of Firestore errors
- Add retry logic for transient errors
- Improve error messages to be more descriptive

### 8. Missing Firebase Admin SDK Initialization Error Handling

**Issue:** The migration scripts initialize Firebase Admin SDK but don't have comprehensive error handling for initialization failures.

**Solution:**
- Add try/catch blocks around the initialization code
- Add validation for all required environment variables before attempting initialization

### 9. Incomplete App Router Updates

**Issue:** The `FirebaseAuthTest` page is added to the router, but other Firebase-specific routes might be needed.

**Solution:**
- Add routes for Firebase-specific authentication flows if needed
- Ensure all protected routes work with both authentication systems during migration

### 10. Missing Firebase Custom Claims for Role-Based Access

**Issue:** Firebase Auth doesn't have built-in role management like Supabase, so custom claims need to be set up.

**Solution:**
- Update the migration script to set custom claims for user roles in Firebase Auth
- Ensure the `FirebaseAuthContext` checks for these claims

## Implementation Plan

1. **Fix Environment Variables**: Ensure all required Firebase variables are present and properly formatted
2. **Update Auth Providers**: Modify `App.tsx` to use the appropriate auth provider
3. **Standardize User Structure**: Update `FirebaseAuthContext` to provide a consistent user object structure
4. **Update Protected Routes**: Modify the `ProtectedRoute` component to work with both auth systems
5. **Enhance Error Handling**: Improve error handling in Firestore utilities and migration scripts
6. **Test Authentication Flows**: Verify all auth flows work with Firebase
7. **Run Migration Scripts**: Execute the migration scripts with proper error handling
8. **Verify Data Integrity**: Ensure all data is correctly migrated to Firebase

## Recommended Changes

### 1. Update App.tsx for Parallel Authentication

```tsx
import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageProvider } from './context/PageContext';
import { DonationProvider } from './context/DonationContext';
import { AuthProvider } from './context/AuthContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './router';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FirebaseAuthProvider>
          <ThemeProvider>
            <DonationProvider>
              <PageProvider>
                <BrowserRouter>
                  <AppRouter />
                </BrowserRouter>
              </PageProvider>
            </DonationProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
```

### 2. Create a Universal Protected Route

```tsx
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Supabase Auth
import { useFirebaseAuth } from '../../context/FirebaseAuthContext'; // Firebase Auth
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'donor' | 'volunteer' | 'admin';
  authSystem?: 'supabase' | 'firebase' | 'both';
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  authSystem = 'both' 
}: ProtectedRouteProps) => {
  const supabaseAuth = useAuth();
  const firebaseAuth = useFirebaseAuth();
  const location = useLocation();
  
  // Determine which auth system to use
  const auth = authSystem === 'supabase' ? supabaseAuth : 
               authSystem === 'firebase' ? firebaseAuth :
               // For 'both', prefer Firebase if authenticated, otherwise try Supabase
               (firebaseAuth.isAuthenticated ? firebaseAuth : supabaseAuth);
  
  const { isAuthenticated, user, loading } = auth;

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get role based on auth system
  const role = authSystem === 'firebase' 
    ? user?.role 
    : user?.user_metadata?.role;

  // If role is required but user doesn't have it, redirect to appropriate page
  if (requiredRole && role !== requiredRole) {
    if (role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (role === 'volunteer') {
      return <Navigate to="/volunteer-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role (or no role required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
```

### 3. Update Firebase Initialization with Better Error Handling

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check for required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing Firebase credentials: ${missingVars.join(', ')}. Please check your .env file.`);
}

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { auth, db };
```

## Testing Checklist

- [ ] Verify all Firebase environment variables are correctly set
- [ ] Test Firebase authentication with test users
- [ ] Verify role-based access control works with Firebase
- [ ] Test data migration from Supabase to Firestore
- [ ] Verify all application features work with Firebase
- [ ] Test fallback to Supabase if Firebase fails (during migration period)
- [ ] Verify error handling for authentication and database operations

## Conclusion

The migration from Supabase to Firebase is well underway with most of the necessary components implemented. Addressing the identified issues will ensure a smooth transition with minimal disruption to users. The parallel authentication approach allows for gradual migration and testing, reducing the risk of service interruptions.

Once all issues are resolved and testing is complete, the final step will be to remove the Supabase dependencies and update the application to use Firebase exclusively. 