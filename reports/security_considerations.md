# Security Considerations: Firebase Storage to Supabase Storage Migration

## Overview

This document outlines the security considerations when migrating from Firebase Storage to Supabase Storage while continuing to use Firebase for Authentication, Cloud Firestore, and other services. Security is a critical aspect of this migration, as it involves changing how files are stored, accessed, and protected.

## Authentication and Authorization

### Current Firebase Storage Security Model

Firebase Storage uses a rule-based security model defined in `storage.rules`:

```
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'ADMIN';
    }
    
    // User avatars
    match /avatars/{userId}/{fileName} {
      // Anyone can read avatars
      allow read: if true;
      
      // Users can upload their own avatar
      allow write: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins can manage all avatars
      allow write: if isAdmin();
    }
    
    // Media files
    match /media/{fileName} {
      // Anyone can read media files
      allow read: if true;
      
      // Only admins can upload media
      allow write: if isAdmin();
    }
    
    // Project files
    match /projects/{projectId}/{fileName} {
      // Anyone can read project files
      allow read: if true;
      
      // Only admins can manage project files
      allow write: if isAdmin();
    }
  }
}
```

### Supabase Storage Security Model

Supabase Storage uses PostgreSQL Row-Level Security (RLS) policies:

```sql
-- Example RLS policies for the 'avatars' bucket
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()
);

-- Example RLS policy for admin access
CREATE POLICY "Admins can do anything"
ON storage.objects
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);
```

### Authentication Bridge Challenges

Since we're continuing to use Firebase Authentication but migrating to Supabase Storage, we need to bridge the authentication systems:

1. **Firebase Auth Token vs. Supabase JWT**: Firebase and Supabase use different token formats and validation mechanisms.

2. **Custom Claims**: Firebase Auth allows custom claims in tokens (like `role: 'ADMIN'`), which need to be mapped to Supabase's authorization system.

3. **Token Verification**: Supabase expects its own JWT format for authenticated requests.

### Recommended Authentication Bridge Solution

Create a server-side API endpoint that:

1. Verifies the Firebase Auth token
2. Extracts user information and claims
3. Generates a Supabase JWT with equivalent permissions
4. Returns the Supabase JWT to the client

```typescript
// Example server-side endpoint (e.g., in Firebase Functions)
app.post('/api/auth/supabase-token', async (req, res) => {
  try {
    // Verify Firebase token
    const authHeader = req.headers.authorization;
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Extract user info
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    const role = decodedToken.role || 'USER';
    const isAdmin = role === 'ADMIN';
    
    // Generate Supabase JWT
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      sub: userId,
      email: email,
      role: role,
      is_admin: isAdmin,
    };
    
    const supabaseJWT = jwt.sign(
      payload,
      process.env.SUPABASE_JWT_SECRET,
      { algorithm: 'HS256' }
    );
    
    res.json({ token: supabaseJWT });
  } catch (error) {
    console.error('Error generating Supabase token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

## File Access Control

### Public vs. Private Files

Both Firebase Storage and Supabase Storage support public and private files:

1. **Public Files**: Accessible to anyone with the URL
2. **Private Files**: Require authentication to access

When migrating, ensure that the same access control levels are maintained:

```typescript
// Supabase Storage adapter for private files
async getPrivateFileUrl(path: string, expiresIn: number = 60): Promise<{ url: string; error: any }> {
  try {
    const [bucket, ...pathParts] = path.split('/');
    const filename = pathParts.join('/');
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filename, expiresIn);
      
    if (error) throw error;
    
    return { url: data.signedUrl, error: null };
  } catch (error) {
    return { url: '', error };
  }
}
```

### URL Security

Firebase Storage URLs can include security tokens:
```
https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
```

Supabase signed URLs also include security tokens:
```
https://[project-ref].supabase.co/storage/v1/object/sign/[bucket]/[path]?token=[token]&expires=[timestamp]
```

Ensure that:
1. Signed URLs have appropriate expiration times
2. Public URLs are only used for truly public content
3. URL tokens are not logged or exposed in client-side code

## Data Protection

### File Encryption

Both Firebase Storage and Supabase Storage encrypt files at rest:

1. **Firebase Storage**: Uses Google Cloud Storage's server-side encryption
2. **Supabase Storage**: Uses AWS S3's server-side encryption

No additional action is required to maintain encryption during migration.

### Sensitive Data in Metadata

Check for sensitive data in file metadata:

```typescript
// Example of checking and sanitizing metadata
function sanitizeMetadata(metadata: any): any {
  const sanitized = { ...metadata };
  
  // Remove any sensitive fields
  delete sanitized.sensitiveField1;
  delete sanitized.sensitiveField2;
  
  return sanitized;
}

// Use in upload function
async uploadFile(path: string, file: File, metadata?: any): Promise<{ url: string; error: any }> {
  const sanitizedMetadata = sanitizeMetadata(metadata);
  // Upload with sanitized metadata
}
```

## Content Security

### File Type Validation

Maintain strict file type validation:

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function validateFileType(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type);
}
```

### File Size Limits

Enforce file size limits:

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
```

### Malware Scanning

Consider implementing malware scanning for uploaded files:

1. **Client-side**: Basic validation of file types and sizes
2. **Server-side**: Use a service like ClamAV or VirusTotal API
3. **Post-upload**: Scan files asynchronously and remove if threats are detected

## Security Testing

### Penetration Testing

Before completing the migration, conduct security testing:

1. **Authentication Bypass**: Attempt to access files without proper authentication
2. **Authorization Bypass**: Attempt to access files without proper authorization
3. **Injection Attacks**: Test for SQL injection in Supabase RLS policies
4. **URL Manipulation**: Attempt to access files by manipulating URLs

### Security Monitoring

Implement security monitoring for the new storage system:

1. **Access Logs**: Monitor access to sensitive files
2. **Failed Access Attempts**: Track and alert on suspicious access patterns
3. **Large File Uploads**: Monitor for unusually large file uploads
4. **Unusual Activity**: Track and alert on unusual activity patterns

## Compliance Considerations

### Data Residency

Supabase Storage uses AWS S3, which may have different data residency implications than Firebase Storage:

1. **Firebase Storage**: Uses Google Cloud Storage with configurable regions
2. **Supabase Storage**: Uses AWS S3 with the region determined by your Supabase project

Ensure that the Supabase region meets your data residency requirements.

### Regulatory Compliance

Consider regulatory requirements:

1. **GDPR**: Ensure proper data processing agreements are in place
2. **HIPAA**: If storing protected health information, ensure compliance
3. **CCPA/CPRA**: Ensure compliance with California privacy laws
4. **Industry-specific**: Consider any industry-specific regulations

## Conclusion

Migrating from Firebase Storage to Supabase Storage while maintaining Firebase Authentication requires careful consideration of security implications. By implementing a proper authentication bridge, maintaining access controls, and following security best practices, you can ensure a secure migration.

Key recommendations:

1. **Implement a robust authentication bridge** between Firebase Auth and Supabase Storage
2. **Carefully translate security rules** from Firebase to Supabase RLS policies
3. **Maintain strict file validation** for type, size, and content
4. **Conduct thorough security testing** before completing the migration
5. **Implement security monitoring** for the new storage system

By following these recommendations, you can maintain or improve the security posture of your application during and after the migration. 