# Vercel Deployment Guide

## Setting Up Environment Variables in Vercel

When deploying the HopeCare application to Vercel, you need to properly configure environment variables to ensure Firebase and other services work correctly.

### Required Environment Variables

The following environment variables must be set in your Vercel project:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Steps to Configure Environment Variables in Vercel

1. **Log in to your Vercel account** and navigate to your project dashboard.

2. **Click on the "Settings" tab** in the top navigation bar.

3. **Select "Environment Variables"** from the left sidebar.

4. **Add each environment variable** by:
   - Entering the variable name (e.g., `VITE_FIREBASE_API_KEY`)
   - Entering the corresponding value
   - Selecting the environments where it should be available (Production, Preview, Development)
   - Click "Add" to save each variable

5. **Deploy your application** after setting all environment variables.

### Verifying Environment Variables

After deployment, you can verify that your environment variables are correctly set by:

1. Opening your deployed application
2. Opening the browser's developer console
3. Checking for any Firebase initialization errors

If you see errors related to missing Firebase credentials, double-check your environment variables in the Vercel dashboard.

### Using the Fallback Mechanism

The application includes a fallback mechanism for Firebase initialization, which will:

1. Log which environment variables are missing
2. Attempt to use default values if environment variables are not set
3. Display a user-friendly error message if initialization fails

However, it's always best to properly configure the environment variables for production deployments.

## Troubleshooting

If you encounter issues with Firebase initialization:

1. **Check the browser console** for specific error messages
2. **Verify environment variables** are correctly set in Vercel
3. **Ensure Firebase project settings** match the environment variables
4. **Check Firebase project permissions** to ensure the application has the necessary access

For additional help, refer to the [Firebase documentation](https://firebase.google.com/docs/web/setup) or contact the development team. 