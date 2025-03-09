# Firebase Security Rules

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    function isModerator() {
      return isAuthenticated() && 
        (request.auth.token.role == 'moderator' || request.auth.token.role == 'admin');
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasPermission(permission) {
      return isAuthenticated() && 
        (request.auth.token.permissions is list && 
         permission in request.auth.token.permissions);
    }
    
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read public user profiles
      allow read: if true;
      
      // Only the user or an admin can update their profile
      allow update: if isOwner(userId) || isAdmin();
      
      // Only admins can create or delete users
      allow create, delete: if isAdmin();
      
      // User's private data subcollection
      match /private/{document} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
    }
    
    // Donations collection
    match /donations/{donationId} {
      // Donors can see their own donations
      // Admins and moderators can see all donations
      allow read: if isAuthenticated() && 
        (resource.data.user_id == request.auth.uid || isModerator());
      
      // Only the system can create donations (via Cloud Functions)
      allow create: if isAdmin() || hasPermission('create_donation');
      
      // Only admins can update or delete donations
      allow update, delete: if isAdmin();
    }
    
    // Projects collection
    match /projects/{projectId} {
      // Anyone can read projects
      allow read: if true;
      
      // Only admins can create, update, or delete projects
      allow create, update, delete: if isAdmin();
      
      // Project updates subcollection
      match /updates/{updateId} {
        allow read: if true;
        allow create, update, delete: if isAdmin() || 
          hasPermission('manage_project_updates');
      }
    }
    
    // Volunteer profiles collection
    match /volunteer_profiles/{profileId} {
      // Volunteers can read their own profile
      // Admins and moderators can read all profiles
      allow read: if isAuthenticated() && 
        (resource.data.user_id == request.auth.uid || isModerator());
      
      // Volunteers can create and update their own profile
      allow create, update: if isAuthenticated() && 
        request.resource.data.user_id == request.auth.uid;
      
      // Only admins can delete volunteer profiles
      allow delete: if isAdmin();
    }
    
    // Analytics events collection
    match /analytics_events/{eventId} {
      // Anyone can create analytics events
      allow create: if true;
      
      // Only admins can read, update, or delete analytics events
      allow read, update, delete: if isAdmin();
    }
    
    // Media library collection
    match /media/{mediaId} {
      // Anyone can read media
      allow read: if true;
      
      // Only admins can create, update, or delete media
      allow create, update, delete: if isAdmin() || 
        hasPermission('manage_media');
    }
    
    // Audit logs collection
    match /audit_logs/{logId} {
      // Only admins can read audit logs
      allow read: if isAdmin();
      
      // System can create audit logs
      allow create: if isAuthenticated();
      
      // No one can update or delete audit logs
      allow update, delete: if false;
    }
  }
}
```

## Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    function isModerator() {
      return isAuthenticated() && 
        (request.auth.token.role == 'moderator' || request.auth.token.role == 'admin');
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isDocumentType() {
      return request.resource.contentType.matches('application/pdf') ||
             request.resource.contentType.matches('application/msword') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    function isFileSizeValid() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    // Default deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // User avatars
    match /avatars/{userId}/{fileName} {
      // Anyone can read avatars
      allow read: if true;
      
      // Users can upload their own avatar
      // File must be an image and less than 5MB
      allow write: if isOwner(userId) && isImageType() && isFileSizeValid();
    }
    
    // Media library
    match /media/{mediaId}/{fileName} {
      // Anyone can read media
      allow read: if true;
      
      // Only admins can upload, update, or delete media
      allow write: if isAdmin() && isFileSizeValid();
    }
    
    // Project images
    match /projects/{projectId}/{fileName} {
      // Anyone can read project images
      allow read: if true;
      
      // Only admins can upload, update, or delete project images
      allow write: if isAdmin() && isImageType() && isFileSizeValid();
    }
    
    // Volunteer documents
    match /volunteers/{userId}/{fileName} {
      // Volunteers can read their own documents
      // Admins and moderators can read all volunteer documents
      allow read: if isOwner(userId) || isModerator();
      
      // Volunteers can upload their own documents
      // File must be a document and less than 5MB
      allow write: if isOwner(userId) && isDocumentType() && isFileSizeValid();
    }
    
    // Temporary uploads (for processing)
    match /temp/{userId}/{fileName} {
      // Users can read their own temporary uploads
      allow read: if isOwner(userId);
      
      // Users can upload temporary files
      // Files must be less than 5MB
      allow write: if isOwner(userId) && isFileSizeValid();
      
      // Temporary files are automatically deleted after 24 hours
    }
  }
}
```

## Implementation Steps

1. **Deploy Firestore Rules**
   - Copy the Firestore rules to the Firebase Console
   - Go to Firestore Database > Rules
   - Paste the rules and click "Publish"

2. **Deploy Storage Rules**
   - Copy the Storage rules to the Firebase Console
   - Go to Storage > Rules
   - Paste the rules and click "Publish"

3. **Set Up Custom Claims for User Roles**
   - Use Firebase Admin SDK to set custom claims
   - Example:
     ```javascript
     const setUserRole = async (uid, role) => {
       try {
         await admin.auth().setCustomUserClaims(uid, { role });
         console.log(`Successfully set role ${role} for user ${uid}`);
       } catch (error) {
         console.error('Error setting custom claims:', error);
       }
     };
     ```

4. **Test Security Rules**
   - Use the Firebase Emulator Suite to test rules
   - Write unit tests for security rules
   - Test with different user roles and permissions

## Security Best Practices

1. **Validate Data on the Server**
   - Use Cloud Functions to validate data
   - Don't rely solely on client-side validation

2. **Use Custom Claims for Authorization**
   - Store user roles and permissions in custom claims
   - Refresh tokens when roles change

3. **Implement Rate Limiting**
   - Use Cloud Functions to implement rate limiting
   - Protect against abuse and DoS attacks

4. **Audit and Monitor**
   - Log all security-relevant events
   - Set up alerts for suspicious activity

5. **Regular Security Reviews**
   - Review security rules regularly
   - Update rules as application requirements change 