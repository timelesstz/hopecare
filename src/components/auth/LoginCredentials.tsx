import React from 'react';
import { Info } from 'lucide-react';

interface LoginCredentialsProps {
  type: 'volunteer' | 'donor';
}

const LoginCredentials: React.FC<LoginCredentialsProps> = ({ type }) => {
  const credentials = type === 'volunteer' ? [
    {
      role: 'Program Lead',
      email: 'emma.parker@example.com',
      password: 'Volunteer2024!'
    },
    {
      role: 'Event Volunteer',
      email: 'michael.chen@example.com',
      password: 'Community2024@'
    },
    {
      role: 'Coordinator',
      email: 'sofia.rodriguez@example.com',
      password: 'Helping2024#'
    }
  ] : [
    {
      role: 'Regular Donor',
      email: 'john.doe@example.com',
      password: 'Welcome2024!'
    },
    {
      role: 'Premium Donor',
      email: 'sarah.smith@example.com',
      password: 'Charity2024$'
    },
    {
      role: 'New Donor',
      email: 'david.wilson@example.com',
      password: 'GiveHope2024#'
    }
  ];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center text-gray-700 mb-3">
        <Info className="h-5 w-5 mr-2 text-blue-500" />
        <span className="font-medium">Sample {type === 'volunteer' ? 'Volunteer' : 'Donor'} Accounts</span>
      </div>
      <div className="space-y-3">
        {credentials.map((cred, index) => (
          <div key={index} className="text-sm">
            <div className="font-medium text-gray-700">{cred.role}:</div>
            <div className="text-gray-600 ml-4">
              <div>Email: {cred.email}</div>
              <div>Password: {cred.password}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginCredentials;