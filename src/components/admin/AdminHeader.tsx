import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const { user, signOut } = useFirebaseAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={onMenuToggle}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Title - visible on mobile */}
          <h1 className="text-xl font-semibold text-gray-900 lg:hidden">
            Admin Panel
          </h1>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* User dropdown */}
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="hidden md:block text-sm font-medium text-gray-700 mr-3">
                  {user?.displayName || user?.email || 'Admin User'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 