import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  PhotoIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    title: 'Content Editor',
    path: '/admin/content',
    icon: DocumentTextIcon,
    description: 'Manage projects and content',
  },
  {
    title: 'Media Library',
    path: '/admin/media',
    icon: PhotoIcon,
    description: 'Upload and manage media files',
  },
  {
    title: 'User Management',
    path: '/admin/users',
    icon: UserGroupIcon,
    description: 'Manage user accounts and roles',
  },
  {
    title: 'Analytics',
    path: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'View insights and metrics',
  },
];

const AdminDashboard: React.FC = () => {
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
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
