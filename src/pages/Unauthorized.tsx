import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { Shield, AlertTriangle, Home } from 'lucide-react';

interface LocationState {
  from?: {
    pathname: string;
  };
  requiredRole?: string;
}

const Unauthorized: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useFirebaseAuth();
  
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';
  const requiredRole = state?.requiredRole || 'ADMIN';
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  const getRoleName = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'DONOR':
        return 'Donor';
      case 'VOLUNTEER':
        return 'Volunteer';
      default:
        return role;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This page requires <strong>{getRoleName(requiredRole)}</strong> privileges.
                  {user && (
                    <span> You are currently logged in as {user.role || 'an unknown role'}.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Home
              </button>
            </div>
            
            {user && (
              <div>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Logout and Sign In with Different Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 