import React from 'react';
import { Lock, Shield, Smartphone } from 'lucide-react';

const SecuritySettings: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
      
      <div className="space-y-6">
        {/* Password Change */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="font-medium text-gray-900">Password</h4>
            </div>
            <button className="text-rose-600 hover:text-rose-700">Change</button>
          </div>
          <p className="text-sm text-gray-500">
            Last changed 3 months ago
          </p>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
            </div>
            <button className="text-rose-600 hover:text-rose-700">Enable</button>
          </div>
          <p className="text-sm text-gray-500">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Login Devices */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="font-medium text-gray-900">Active Sessions</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Chrome on MacBook Pro</p>
                <p className="text-xs text-gray-500">Last active: 2 minutes ago</p>
              </div>
              <button className="text-sm text-rose-600 hover:text-rose-700">
                Sign out
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Safari on iPhone</p>
                <p className="text-xs text-gray-500">Last active: 1 hour ago</p>
              </div>
              <button className="text-sm text-rose-600 hover:text-rose-700">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;