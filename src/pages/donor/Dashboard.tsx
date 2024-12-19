import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DonorDashboard: React.FC = () => {
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

  const donationHistory = [
    { id: 1, date: '2023-12-15', amount: 100, program: 'Education' },
    { id: 2, date: '2023-11-20', amount: 250, program: 'Health' },
    { id: 3, date: '2023-10-05', amount: 150, program: 'Economic Empowerment' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💰</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Total Donations</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">$500</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Impact Score</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">85</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Programs Supported</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donation History */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Donation History</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Make a Donation
              </button>
            </div>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donationHistory.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${donation.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.program}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Your Impact</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="prose max-w-none">
                <p>Your donations have helped:</p>
                <ul>
                  <li>Provide education to 5 children</li>
                  <li>Support healthcare for 3 families</li>
                  <li>Fund 2 small business initiatives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
