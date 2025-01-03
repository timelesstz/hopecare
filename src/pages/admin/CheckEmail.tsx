import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const CheckEmail = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold">Check your email</h2>
            <p className="mt-2 text-sm">
              We've sent you a verification link to your email address.
              Please click the link to verify your account.
            </p>
            <div className="mt-6 space-y-4">
              <p className="text-sm">
                Didn't receive the email?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  onClick={() => window.location.reload()}
                >
                  Click here to resend
                </button>
              </p>
              <p className="text-sm">
                <Link
                  to="/admin/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Return to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
