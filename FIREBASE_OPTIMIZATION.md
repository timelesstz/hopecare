# Firebase Performance Optimization Guidelines

## Firestore Query Optimization

### 1. Create Appropriate Indexes

Firestore requires composite indexes for complex queries. Here are the indexes we need to create:

```
// users collection
users (role, created_at, DESC)
users (status, created_at, DESC)
users (role, status, created_at, DESC)

// donations collection
donations (user_id, created_at, DESC)
donations (status, created_at, DESC)
donations (project_id, created_at, DESC)

// analytics_events collection
analytics_events (event_type, timestamp, DESC)
analytics_events (user_id, timestamp, DESC)
```

To create these indexes:
1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Add Index"
3. Select the collection
4. Add the fields and specify the order
5. Click "Create"

### 2. Query Optimization Techniques

- **Use Limit and Pagination**
  ```javascript
  // Instead of fetching all documents
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  
  // Use pagination
  const first = query(usersRef, orderBy('created_at'), limit(25));
  const snapshot = await getDocs(first);
  
  // Get next page
  const last = snapshot.docs[snapshot.docs.length - 1];
  const next = query(usersRef, orderBy('created_at'), startAfter(last), limit(25));
  ```

- **Use Compound Queries Instead of OR Queries**
  ```javascript
  // Instead of using OR queries (which execute multiple queries)
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['admin', 'moderator'])
  );
  
  // For complex OR conditions, consider using separate queries and merging results
  ```

- **Avoid Unnecessary Document Reads**
  ```javascript
  // Instead of fetching the entire collection
  const querySnapshot = await getDocs(collection(db, 'users'));
  
  // Use queries to filter server-side
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'admin'),
    orderBy('created_at', 'desc'),
    limit(10)
  );
  ```

### 3. Denormalize Data When Necessary

- Store frequently accessed related data in the same document
- Use subcollections for one-to-many relationships
- Consider data duplication for read-heavy operations

Example:
```javascript
// User document with profile information
{
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  // Include summary data to avoid additional queries
  donationStats: {
    totalAmount: 5000,
    lastDonationDate: '2023-05-15',
    donationCount: 12
  }
}
```

## Firebase Storage Optimization

### 1. Optimize Image Uploads

- Resize images before uploading
- Compress images to reduce file size
- Use appropriate image formats (WebP for web)

```javascript
// Example image processing before upload
async function uploadOptimizedImage(file, path) {
  // Resize and compress image
  const compressedFile = await compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8
  });
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressedFile);
  return getDownloadURL(storageRef);
}
```

### 2. Use Caching Headers

Set appropriate caching headers for static assets:

```javascript
// Set metadata with caching headers
const metadata = {
  cacheControl: 'public,max-age=31536000',
  contentType: 'image/jpeg'
};

const storageRef = ref(storage, 'images/profile.jpg');
await uploadBytes(storageRef, file, metadata);
```

### 3. Use Firebase Storage Rules for Security

```
// Example Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile.jpg {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## Authentication Optimization

### 1. Implement Caching for User Data

```javascript
// Cache user data in localStorage
function cacheUserData(user) {
  if (user) {
    localStorage.setItem('user_cache', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      timestamp: Date.now()
    }));
  }
}

// Get cached user data
function getCachedUserData() {
  const cachedData = localStorage.getItem('user_cache');
  if (cachedData) {
    const userData = JSON.parse(cachedData);
    // Check if cache is still valid (e.g., less than 30 minutes old)
    if (Date.now() - userData.timestamp < 30 * 60 * 1000) {
      return userData;
    }
  }
  return null;
}
```

### 2. Use Custom Claims for User Roles

```javascript
// In Firebase Admin SDK (server-side)
async function setUserRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
}

// Client-side: force token refresh to get updated claims
async function refreshUserClaims() {
  await auth.currentUser.getIdToken(true);
}
```

## Real-time Updates Optimization

### 1. Use Snapshot Listeners Efficiently

```javascript
// Instead of listening to an entire collection
const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
  // This will trigger on any change to any user
});

// Listen to specific documents or filtered queries
const q = query(
  collection(db, 'users'),
  where('role', '==', 'admin'),
  limit(10)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  // This will only trigger for changes to admin users
});

// Don't forget to unsubscribe when component unmounts
useEffect(() => {
  const unsubscribe = onSnapshot(...);
  return () => unsubscribe();
}, []);
```

### 2. Use Server Timestamps

```javascript
// Use serverTimestamp for consistent timestamps
await addDoc(collection(db, 'events'), {
  title: 'New Event',
  created_at: serverTimestamp()
});
```

## Monitoring and Optimization Tools

1. **Firebase Performance Monitoring**
   - Implement Firebase Performance SDK
   - Monitor network requests, app startup time, and screen rendering

2. **Firebase Debug View**
   - Use Firebase console's Debug View to analyze queries
   - Identify slow queries and missing indexes

3. **Firestore Usage Dashboard**
   - Monitor read/write operations
   - Track storage usage
   - Set up billing alerts

## Implementation Plan

1. **Audit Current Queries**
   - Review all Firestore queries in the codebase
   - Identify queries that need optimization

2. **Create Indexes**
   - Create necessary composite indexes based on query patterns

3. **Implement Pagination**
   - Update list views to use pagination
   - Implement infinite scrolling where appropriate

4. **Optimize Data Structure**
   - Review data model and denormalize where necessary
   - Create aggregation functions for summary data

5. **Set Up Monitoring**
   - Implement Firebase Performance Monitoring
   - Create custom logging for slow operations 