import React from 'react';
import { Download } from 'lucide-react';
import { Donation } from '../../hooks/useDonorData';

interface DonationHistoryProps {
  donations?: Donation[];
}

const DonationHistory: React.FC<DonationHistoryProps> = ({ donations = [] }) => {
  // Default donations if none are provided
  const defaultDonations: Donation[] = [
    { 
      id: '1', 
      donor_id: '1',
      amount: 100, 
      date: new Date("2024-03-15").toISOString(), 
      campaign: "Education Fund", 
      status: "completed" 
    },
    { 
      id: '2', 
      donor_id: '1',
      amount: 50, 
      date: new Date("2024-03-01").toISOString(), 
      campaign: "Community Garden", 
      status: "completed" 
    },
    { 
      id: '3', 
      donor_id: '1',
      amount: 75, 
      date: new Date("2024-02-15").toISOString(), 
      campaign: "Youth Programs", 
      status: "completed" 
    },
  ];

  const displayDonations = donations.length > 0 ? donations : defaultDonations;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
          <button className="flex items-center text-rose-600 hover:text-rose-700">
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-500">
                <th className="pb-4">Amount</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Campaign</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayDonations.map((donation) => (
                <tr key={donation.id}>
                  <td className="py-4 text-sm font-medium text-gray-900">
                    ${donation.amount}
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm text-gray-500">{donation.campaign}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      donation.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : donation.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {displayDonations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No donations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationHistory;