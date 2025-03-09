# Implementation Plan: Firebase Storage to Supabase Storage Migration

## Overview

This document outlines a detailed implementation plan for migrating from Firebase Storage to Supabase Storage while continuing to use Firebase for Authentication, Cloud Firestore, and other services. The plan is structured in phases to minimize disruption and ensure a smooth transition.

## Phase 1: Setup and Preparation (Week 1)

### 1.1 Environment Setup

- [ ] Create a Supabase project
- [ ] Configure Supabase Storage buckets:
  - [ ] `avatars` - For user profile images
  - [ ] `media` - For general media files
  - [ ] `projects` - For project-related files
  - [ ] `events` - For event-related files
- [ ] Set up appropriate RLS (Row Level Security) policies for each bucket
- [ ] Update environment variables:
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

### 1.2 Create Storage Interface

Create an abstract storage interface that can be implemented by both Firebase and Supabase:

```typescript
// src/lib/storage/StorageInterface.ts
export interface StorageInterface {
  uploadFile(path: string, file: File, metadata?: any): Promise<{ url: string; error: any }>;
  uploadBuffer(path: string, buffer: Buffer, metadata?: any): Promise<{ url: string; error: any }>;
  getFileUrl(path: string): Promise<{ url: string; error: any }>;
  deleteFile(path: string): Promise<{ success: boolean; error: any }>;
  listFiles(path: string): Promise<{ files: string[]; error: any }>;
}
```

### 1.3 Implement Firebase Storage Adapter

```typescript
// src/lib/storage/FirebaseStorageAdapter.ts
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase';
import { StorageInterface } from './StorageInterface';

export class FirebaseStorageAdapter implements StorageInterface {
  async uploadFile(path: string, file: File, metadata?: any): Promise<{ url: string; error: any }> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error) {
      return { url: '', error };
    }
  }
  
  // Implement other methods...
}
```

### 1.4 Implement Supabase Storage Adapter

```typescript
// src/lib/storage/SupabaseStorageAdapter.ts
import { supabase } from '../supabase';
import { StorageInterface } from './StorageInterface';

export class SupabaseStorageAdapter implements StorageInterface {
  async uploadFile(path: string, file: File, metadata?: any): Promise<{ url: string; error: any }> {
    try {
      // Extract bucket and filename from path (e.g., "avatars/user123.jpg")
      const [bucket, ...pathParts] = path.split('/');
      const filename = pathParts.join('/');
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { contentType: metadata?.contentType });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);
        
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: '', error };
    }
  }
  
  // Implement other methods...
}
```

### 1.5 Create Storage Factory

```typescript
// src/lib/storage/StorageFactory.ts
import { StorageInterface } from './StorageInterface';
import { FirebaseStorageAdapter } from './FirebaseStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';

// Feature flag to control which storage provider to use
const USE_SUPABASE_STORAGE = import.meta.env.VITE_USE_SUPABASE_STORAGE === 'true';

export function getStorageProvider(): StorageInterface {
  return USE_SUPABASE_STORAGE 
    ? new SupabaseStorageAdapter() 
    : new FirebaseStorageAdapter();
}

export const storageProvider = getStorageProvider();
```

## Phase 2: Refactor Storage Utilities (Week 1-2)

### 2.1 Update Storage Utilities

Refactor `src/utils/storageUtils.ts` to use the storage interface:

```typescript
import { storageProvider } from '../lib/storage/StorageFactory';

export async function uploadFile(path: string, file: File, metadata?: any) {
  return storageProvider.uploadFile(path, file, metadata);
}

// Update other functions...
```

### 2.2 Update Image Processor

Refactor `src/utils/imageProcessor.ts` to use the storage interface:

```typescript
import { storageProvider } from '../lib/storage/StorageFactory';

static async uploadProfileImage(userId: string, file: Buffer, mimeType: string): Promise<string> {
  try {
    const processed = await this.processProfileImage(file, mimeType);
    const filename = `profile-${userId}-${Date.now()}.${processed.format}`;
    const path = `avatars/${filename}`;
    
    const { url, error } = await storageProvider.uploadBuffer(path, processed.buffer, {
      contentType: `image/${processed.format}`
    });
    
    if (error) throw new Error(error.message);
    
    // Update user profile with new avatar URL
    await db.collection('users').doc(userId).update({ avatar_url: url });
    
    return url;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw new Error('Failed to upload profile image');
  }
}
```

## Phase 3: Update Components (Week 2)

### 3.1 Update MediaLibrary Component

Refactor `src/components/admin/MediaLibrary.tsx` to use the storage interface:

```typescript
import { storageProvider } from '../../lib/storage/StorageFactory';

// Replace direct Firebase Storage usage:
const uploadFile = async () => {
  try {
    const path = `media/${filename}`;
    const { url, error } = await storageProvider.uploadFile(path, file);
    
    if (error) throw error;
    
    // Save metadata to Firestore
    await db.collection('media').add({
      filename,
      url,
      uploadedBy: auth.currentUser?.uid,
      uploadedAt: new Date().toISOString(),
      // ...other metadata
    });
    
    // ...
  } catch (error) {
    // ...
  }
};
```

### 3.2 Update ProfileEditor Component

Refactor `src/components/user/ProfileEditor.tsx` in a similar way.

## Phase 4: Testing and Validation (Week 2-3)

### 4.1 Unit Testing

- [ ] Write unit tests for both storage adapters
- [ ] Test all storage operations with both providers
- [ ] Verify error handling and edge cases

### 4.2 Integration Testing

- [ ] Test components with both storage providers
- [ ] Verify file uploads, downloads, and deletions
- [ ] Test with different file types and sizes

### 4.3 End-to-End Testing

- [ ] Test the complete user flows that involve file operations
- [ ] Verify that all features work correctly with Supabase Storage

## Phase 5: Data Migration (Week 3)

### 5.1 Create Migration Script

```typescript
// scripts/migrate-storage.js
const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Initialize Firebase
const firebaseApp = initializeApp();
const firebaseStorage = getStorage(firebaseApp);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function downloadFirebaseFile(filePath) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const localPath = path.join(tempDir, path.basename(filePath));
  const file = fs.createWriteStream(localPath);
  
  const [url] = await firebaseStorage.bucket().file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  
  const response = await fetch(url);
  await new Promise((resolve, reject) => {
    response.body.pipe(file);
    response.body.on('error', reject);
    file.on('finish', resolve);
  });
  
  return localPath;
}

async function uploadToSupabase(bucket, filePath, localPath) {
  const fileContent = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileContent, {
      upsert: true,
    });
  
  if (error) {
    throw error;
  }
  
  return data;
}

async function migrateFiles() {
  try {
    // Get all files from Firebase Storage
    const [files] = await firebaseStorage.bucket().getFiles();
    
    for (const file of files) {
      const filePath = file.name;
      console.log(`Migrating: ${filePath}`);
      
      // Determine the appropriate bucket in Supabase
      let bucket = 'media'; // default bucket
      if (filePath.startsWith('avatars/')) {
        bucket = 'avatars';
      } else if (filePath.startsWith('projects/')) {
        bucket = 'projects';
      } else if (filePath.startsWith('events/')) {
        bucket = 'events';
      }
      
      // Download the file from Firebase
      const localPath = await downloadFirebaseFile(filePath);
      
      // Upload to Supabase
      await uploadToSupabase(bucket, filePath, localPath);
      
      // Clean up local file
      fs.unlinkSync(localPath);
      
      console.log(`Successfully migrated: ${filePath}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateFiles();
```

### 5.2 Update Database References

Create a script to update file URLs in Firestore:

```typescript
// scripts/update-file-urls.js
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { createClient } = require('@supabase/supabase-js');

// Initialize Firebase
const firebaseApp = initializeApp();
const db = getFirestore(firebaseApp);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to convert Firebase URL to Supabase URL
function convertUrl(firebaseUrl) {
  // Extract the path from Firebase URL
  const regex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/([^?]+)/;
  const match = firebaseUrl.match(regex);
  
  if (!match) return null;
  
  const encodedPath = match[1];
  const path = decodeURIComponent(encodedPath);
  
  // Determine the appropriate bucket
  let bucket = 'media'; // default bucket
  if (path.startsWith('avatars/')) {
    bucket = 'avatars';
  } else if (path.startsWith('projects/')) {
    bucket = 'projects';
  } else if (path.startsWith('events/')) {
    bucket = 'events';
  }
  
  // Generate Supabase URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
}

async function updateUrls() {
  try {
    // Update user avatars
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      if (userData.avatar_url && userData.avatar_url.includes('firebasestorage')) {
        const newUrl = convertUrl(userData.avatar_url);
        if (newUrl) {
          await doc.ref.update({ avatar_url: newUrl });
          console.log(`Updated avatar URL for user: ${doc.id}`);
        }
      }
    }
    
    // Update media collection
    const mediaSnapshot = await db.collection('media').get();
    for (const doc of mediaSnapshot.docs) {
      const mediaData = doc.data();
      if (mediaData.url && mediaData.url.includes('firebasestorage')) {
        const newUrl = convertUrl(mediaData.url);
        if (newUrl) {
          await doc.ref.update({ url: newUrl });
          console.log(`Updated URL for media: ${doc.id}`);
        }
      }
    }
    
    // Add more collections as needed
    
    console.log('URL updates completed successfully!');
  } catch (error) {
    console.error('URL update failed:', error);
  }
}

updateUrls();
```

## Phase 6: Deployment and Switchover (Week 3)

### 6.1 Deployment Preparation

- [ ] Update environment variables in production
- [ ] Ensure Supabase Storage buckets are properly configured
- [ ] Verify all tests pass with Supabase Storage

### 6.2 Gradual Switchover

- [ ] Deploy the updated code with feature flag set to use Firebase Storage
- [ ] Run the data migration scripts
- [ ] Update database references
- [ ] Switch the feature flag to use Supabase Storage
- [ ] Monitor for any issues

### 6.3 Rollback Plan

In case of issues:
- [ ] Switch the feature flag back to use Firebase Storage
- [ ] Identify and fix issues
- [ ] Retry the switchover

## Phase 7: Cleanup and Documentation (Week 3)

### 7.1 Code Cleanup

- [ ] Remove unused Firebase Storage code
- [ ] Remove feature flags once the migration is stable
- [ ] Optimize Supabase Storage implementation

### 7.2 Documentation

- [ ] Update project documentation to reflect the new storage provider
- [ ] Document the storage interface and adapters
- [ ] Update developer guides and onboarding materials

## Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | Setup and Preparation | 3 days |
| 2 | Refactor Storage Utilities | 3 days |
| 3 | Update Components | 2 days |
| 4 | Testing and Validation | 3 days |
| 5 | Data Migration | 2 days |
| 6 | Deployment and Switchover | 2 days |
| 7 | Cleanup and Documentation | 1 day |

**Total Duration**: Approximately 2-3 weeks

## Success Criteria

- All file operations work correctly with Supabase Storage
- All existing files are migrated successfully
- No disruption to user experience during the migration
- Performance is equal to or better than with Firebase Storage
- All tests pass with the new storage provider 