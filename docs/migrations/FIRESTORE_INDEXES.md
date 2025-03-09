# Firestore Indexes for HopeCare

This document provides information about the Firestore indexes required for the HopeCare application to function properly.

## Required Indexes

The following composite indexes are required for the application:

### Users Collection

1. **Users by Role and Creation Date**
   - Collection: `users`
   - Fields:
     - `role` (Ascending)
     - `created_at` (Descending)
   - Purpose: Used for listing users by role (admin, donor, volunteer) sorted by creation date

### Events Collection

1. **Events by Creation Date**
   - Collection: `events`
   - Fields:
     - `created_at` (Descending)
   - Purpose: Used for listing events sorted by creation date

2. **Events by Status and Date**
   - Collection: `events`
   - Fields:
     - `status` (Ascending)
     - `date` (Ascending)
   - Purpose: Used for filtering events by status and sorting by date

## How to Create Indexes

### Method 1: Using the Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Click on the "Indexes" tab
5. Click "Add Index"
6. Fill in the collection name and fields as specified above
7. Click "Create"

### Method 2: Using the Error Link

When you encounter an error message like:

```
Failed to fetch admin users: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/hopecare-app/firestore/indexes?create_composite=...
```

Simply click on the provided link to create the required index automatically.

### Method 3: Using firestore.indexes.json

You can also define all required indexes in a `firestore.indexes.json` file and deploy them using the Firebase CLI:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Then deploy using:

```bash
firebase deploy --only firestore:indexes
```

## Troubleshooting

If you continue to see index-related errors after creating the indexes:

1. **Wait for indexing to complete**: It can take a few minutes for indexes to be created and become available.
2. **Check for typos**: Ensure the collection names and field names match exactly.
3. **Check field types**: Make sure the fields have the correct data types in your documents.
4. **Check console for specific errors**: The Firebase console may provide more details about any issues with your indexes.

## Additional Resources

- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Single-Field Index Limitations](https://firebase.google.com/docs/firestore/query-data/index-overview#single-field_index_limitations)
- [Composite Index Limitations](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_index_limitations) 