import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const menuItems = [
    { title: 'Content Editor', path: '/admin/content', icon: '📝' },
    { title: 'Media Library', path: '/admin/media', icon: '🖼️' },
    { title: 'User Management', path: '/admin/users', icon: '👥' },
    { title: 'Analytics', path: '/admin/analytics', icon: '📊' },
    { title: 'API Configurations', path: '/admin/configs', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{item.icon}</div>
                    <div className="ml-2">
                      <div className="text-lg font-medium text-gray-900">{item.title}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
