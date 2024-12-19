import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const menuItems = [
    { title: 'Content Editor', path: '/admin/content', icon: '📝', description: 'Manage website content' },
    { title: 'Media Library', path: '/admin/media', icon: '🖼️', description: 'Upload and manage media files' },
    { title: 'User Management', path: '/admin/users', icon: '👥', description: 'Manage user accounts' },
    { title: 'Analytics', path: '/admin/analytics', icon: '📊', description: 'View site analytics' },
    { title: 'API Configurations', path: '/admin/configs', icon: '⚙️', description: 'Configure API settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Welcome,</span>
                <span className="ml-1 font-medium text-gray-900">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">{item.icon}</div>
                    </div>
                    <div className="ml-5">
                      <div className="text-lg font-medium text-gray-900">{item.title}</div>
                      <div className="mt-1 text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Stats</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">👥</div>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-medium text-gray-500">Total Users</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">1,234</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">📝</div>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-medium text-gray-500">Content Pages</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">24</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">💰</div>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-medium text-gray-500">Total Donations</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">$12.4k</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">🤝</div>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-medium text-gray-500">Active Volunteers</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">89</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
