import React, { useState, useEffect } from 'react';
import { app } from '../firebase/config';

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode;
}

const FirebaseErrorBoundary: React.FC<FirebaseErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is properly initialized
    const checkFirebaseInitialization = async () => {
      try {
        // If app is an empty object (our fallback), it won't have these properties
        if (!app.name || !app.options) {
          setHasError(true);
          setErrorMessage('Firebase initialization failed: Missing configuration');
        }
        
        // Check for console errors related to Firebase
        const originalConsoleError = console.error;
        console.error = (...args) => {
          const errorString = args.join(' ');
          if (
            errorString.includes('Firebase') && 
            (errorString.includes('already exists') || 
             errorString.includes('initialization failed'))
          ) {
            setHasError(true);
            setErrorMessage('Firebase initialization error: Duplicate initialization detected');
          }
          originalConsoleError(...args);
        };
        
        // Restore original console.error after a short delay
        setTimeout(() => {
          console.error = originalConsoleError;
        }, 2000);
      } catch (error) {
        console.error('Error checking Firebase initialization:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown Firebase initialization error');
      } finally {
        setIsLoading(false);
      }
    };

    checkFirebaseInitialization();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-center text-gray-800">Application Error</h2>
          {errorMessage && (
            <p className="mt-2 text-sm text-center text-red-600">
              {errorMessage}
            </p>
          )}
          <p className="mt-2 text-center text-gray-600">
            We're having trouble connecting to our services. This could be due to:
          </p>
          <ul className="mt-4 text-sm text-gray-600 list-disc list-inside">
            <li>Missing configuration settings</li>
            <li>Network connectivity issues</li>
            <li>Temporary service disruption</li>
          </ul>
          <div className="mt-6">
            <p className="text-sm text-center text-gray-500">
              Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirebaseErrorBoundary; 