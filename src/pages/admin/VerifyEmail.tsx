import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../../lib/firebase';
import { applyActionCode, getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the action code (oobCode) from URL
        const actionCode = searchParams.get('oobCode');
        if (!actionCode) throw new Error('Verification code is missing');

        // Verify the email with Firebase
        await applyActionCode(auth, actionCode);
        
        // Get the current user
        const user = auth.currentUser;
        if (!user) throw new Error('User not found');

        // Update user status to ACTIVE in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 
          status: 'ACTIVE',
          email_verified: true,
          updated_at: new Date().toISOString()
        });

        // Log verification
        const auditLogsCollection = collection(db, 'audit_logs');
        await addDoc(auditLogsCollection, {
          user_id: user.uid,
          action: 'EMAIL_VERIFIED',
          details: {
            timestamp: new Date().toISOString()
          },
          created_at: serverTimestamp()
        });

        // Redirect to login
        setTimeout(() => {
          navigate('/admin/login', {
            state: { message: 'Email verified successfully. You can now log in.' }
          });
        }, 2000);

      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Email verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center">
            {verifying ? (
              <>
                <LoadingSpinner size="lg" />
                <h2 className="mt-4 text-lg font-medium">Verifying your email...</h2>
              </>
            ) : error ? (
              <>
                <div className="text-red-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-red-600">Verification Failed</h2>
                <p className="mt-2 text-sm">{error}</p>
              </>
            ) : (
              <>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-green-600">Email Verified Successfully</h2>
                <p className="mt-2 text-sm">Redirecting to login page...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
