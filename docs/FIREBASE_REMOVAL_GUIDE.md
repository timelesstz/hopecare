# Firebase Dependency Removal Guide

This guide provides a systematic approach to removing Firebase dependencies from the HopeCare application as part of the migration to Supabase.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Removal Process](#step-by-step-removal-process)
   - [Authentication](#authentication)
   - [Database Operations](#database-operations)
   - [Storage](#storage)
   - [Analytics](#analytics)
   - [Cloud Functions](#cloud-functions)
4. [Testing](#testing)
5. [Common Issues](#common-issues)
6. [Checklist](#checklist)

## Overview

The HopeCare application is being migrated from Firebase to Supabase. This guide focuses on the final step: removing all Firebase dependencies after implementing their Supabase equivalents.

## Prerequisites

Before starting the removal process, ensure that:

1. All Supabase services have been implemented and tested
2. The application can run using Supabase for all core functionality
3. You have run the `scripts/remove-firebase-dependencies.js` script to identify remaining Firebase dependencies

## Step-by-Step Removal Process

### Authentication

1. **Replace Firebase Auth Context**

   Replace `FirebaseAuthContext` with `SupabaseAuthContext` in `App.tsx`:

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

2. **Update Auth Hooks**

   Replace `useFirebaseAuth` with `useSupabaseAuth` in all components:

   ```tsx
   // From:
   import { useFirebaseAuth } from '../context/FirebaseAuthContext';
   
   // To:
   import { useSupabaseAuth } from '../context/SupabaseAuthContext';
   ```

3. **Remove Firebase Auth Imports**

   Remove all imports from `firebase/auth`:

   ```tsx
   // Remove:
   import { 
     signInWithEmailAndPassword, 
     createUserWithEmailAndPassword,
     signOut
   } from 'firebase/auth';
   ```

### Database Operations

1. **Replace Firestore Queries**

   Convert all Firestore queries to Supabase equivalents:

   ```tsx
   // From (Firestore):
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

2. **Replace Document Operations**

   Convert document operations:

   ```tsx
   // From (Firestore):
   const docRef = doc(db, 'users', userId);
   await setDoc(docRef, userData);
   
   // To (Supabase):
   const { error } = await supabase
     .from('users')
     .upsert({ id: userId, ...userData });
   ```

3. **Replace Real-time Listeners**

   Convert real-time listeners:

   ```tsx
   // From (Firestore):
   const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
     setUser(doc.data());
   });
   
   // To (Supabase):
   const channel = supabase
     .channel(`public:users:id=eq.${userId}`)
     .on('postgres_changes', { 
       event: '*', 
       schema: 'public', 
       table: 'users',
       filter: `id=eq.${userId}`
     }, (payload) => {
       setUser(payload.new);
     })
     .subscribe();
   
   // Cleanup:
   return () => {
     supabase.removeChannel(channel);
   };
   ```

### Storage

1. **Replace Storage Operations**

   Convert storage operations:

   ```tsx
   // From (Firebase):
   const storageRef = ref(storage, `images/${fileName}`);
   await uploadBytes(storageRef, file);
   const url = await getDownloadURL(storageRef);
   
   // To (Supabase):
   const { data, error } = await supabase.storage
     .from('images')
     .upload(`${fileName}`, file);
   
   const { data: { publicUrl } } = supabase.storage
     .from('images')
     .getPublicUrl(data.path);
   ```

### Analytics

1. **Replace Analytics Events**

   Convert analytics tracking:

   ```tsx
   // From (Firebase):
   logEvent(analytics, 'page_view', {
     page_title: 'Home',
     page_location: window.location.href
   });
   
   // To (Supabase):
   await supabase.from('analytics_events').insert({
     event_name: 'page_view',
     event_data: {
       page_title: 'Home',
       page_location: window.location.href
     },
     user_id: user?.id,
     session_id: sessionId
   });
   ```

### Cloud Functions

1. **Replace Cloud Functions**

   Convert Firebase Cloud Functions to Supabase Edge Functions:

   ```tsx
   // From (Firebase):
   const functionRef = httpsCallable(functions, 'processPayment');
   const result = await functionRef({ amount, currency });
   
   // To (Supabase):
   const { data, error } = await supabase.functions.invoke('process-payment', {
     body: { amount, currency }
   });
   ```

## Testing

After removing Firebase dependencies:

1. Test all authentication flows
2. Verify database operations (CRUD)
3. Check storage functionality
4. Validate analytics tracking
5. Test any functionality that used Cloud Functions

## Common Issues

### 1. Missing Data

If data appears to be missing after migration, check:
- Table names and column names in Supabase queries
- RLS policies that might be restricting access
- Type conversions between Firebase and Supabase

### 2. Authentication Errors

Common authentication issues:
- Session management differences
- Password reset flows
- Email verification processes

### 3. Real-time Updates

If real-time updates aren't working:
- Verify Supabase channel subscriptions
- Check that the correct tables and events are being monitored
- Ensure proper cleanup of subscriptions

## Checklist

Use this checklist to track your progress:

- [ ] Run dependency analysis script
- [ ] Replace Firebase Auth with Supabase Auth
- [ ] Replace Firestore operations with Supabase database operations
- [ ] Replace Firebase Storage with Supabase Storage
- [ ] Replace Firebase Analytics with Supabase analytics
- [ ] Replace Firebase Cloud Functions with Supabase Edge Functions
- [ ] Remove Firebase packages from package.json
- [ ] Remove Firebase configuration files
- [ ] Test all functionality
- [ ] Update documentation

## Final Step

Once all Firebase dependencies have been removed, run:

```bash
npm uninstall firebase firebase-admin
```

This will remove the Firebase packages from your project.
