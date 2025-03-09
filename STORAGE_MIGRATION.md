# Firebase Storage to Supabase Storage Migration Guide

This document provides instructions for migrating from Firebase Storage to Supabase Storage in the HopeCare application.

## Overview

The migration involves:
1. Setting up Supabase Storage
2. Implementing a storage interface with adapters for both Firebase and Supabase
3. Refactoring existing code to use the new interface
4. Migrating existing files from Firebase to Supabase
5. Testing and switching to Supabase Storage

## Prerequisites

- Supabase account and project
- Supabase Storage buckets created (see below)
- Firebase project with existing Storage data

## Required Supabase Storage Buckets

Create the following buckets in your Supabase Storage:

- `avatars` - For user profile images
- `images` - For general images
- `documents` - For document uploads
- `test` - For testing purposes

For each bucket, set the appropriate security policies. Example policy for the `avatars` bucket:

```sql
-- Allow public read access to avatars
CREATE POLICY "Public Access" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "User Upload Access" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Storage Provider Configuration
# Set to 'true' to use Supabase Storage, 'false' to use Firebase Storage
VITE_USE_SUPABASE_STORAGE=false
```

## Migration Steps

### 1. Install Supabase JS Client

```bash
npm install @supabase/supabase-js
```

### 2. Initialize Supabase Client

The Supabase client is initialized in `src/lib/supabase.ts`.

### 3. Storage Interface and Adapters

The migration uses an adapter pattern with:
- `StorageInterface.ts` - Defines the interface for storage operations
- `FirebaseStorageAdapter.ts` - Implements the interface for Firebase Storage
- `SupabaseStorageAdapter.ts` - Implements the interface for Supabase Storage
- `StorageFactory.ts` - Factory to create the appropriate adapter based on configuration

### 4. Testing the Migration

A test component is available at `src/components/StorageTest.tsx` to verify that both storage adapters are working correctly.

To use it, add it to a route in your application:

```tsx
import StorageTest from './components/StorageTest';

// In your routes configuration
<Route path="/storage-test" element={<StorageTest />} />
```

### 5. Migrating Existing Files

To migrate existing files from Firebase to Supabase:

1. List all files in Firebase Storage
2. Download each file
3. Upload to the corresponding path in Supabase Storage

A migration script is available in the `scripts` directory:

```bash
npm run migrate:storage
```

### 6. Switching to Supabase Storage

Once testing is complete and files are migrated, update the environment variable:

```
VITE_USE_SUPABASE_STORAGE=true
```

### 7. Rollback Plan

If issues are encountered with Supabase Storage, you can roll back by:

1. Setting `VITE_USE_SUPABASE_STORAGE=false` to switch back to Firebase Storage
2. Rebuilding and redeploying the application

## File Path Conventions

The storage adapters use the following path conventions:

- User avatars: `avatars/profile-{userId}-{timestamp}.{format}`
- General images: `images/{timestamp}-{filename}`
- Documents: `documents/{userId}/{filename}`
- Test files: `test/{filename}`

## Security Considerations

- Supabase Storage uses Row-Level Security (RLS) policies for access control
- Firebase Storage uses Firebase Security Rules
- Both implementations ensure that users can only access files they are authorized to

## Performance Considerations

- Supabase Storage may have different performance characteristics than Firebase Storage
- Consider implementing caching for frequently accessed files
- Use signed URLs for private files with appropriate expiration times

## Troubleshooting

### Common Issues

1. **CORS Issues**: Ensure CORS is properly configured in Supabase
2. **Permission Errors**: Verify that the RLS policies are correctly set up for the bucket
3. **Missing Files**: Ensure that the file paths are correct and that the files were properly migrated

### Debugging

The storage adapters include detailed error logging. Check the browser console for error messages.

## Contact

For assistance with the storage system, contact the development team. 