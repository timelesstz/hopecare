import React from 'react';
import ApiConfigManager from '../../components/admin/ApiConfigManager';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ConfigsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">API Configurations</h1>
          <ApiConfigManager />
        </div>
      </div>
    </div>
  );
};

export default ConfigsPage;
