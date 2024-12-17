import React from 'react';
import { Download } from 'lucide-react';

interface Donation {
  id: number;
  amount: number;
  date: string;
  campaign: string;
  status: string;
}

const DonationHistory: React.FC = () => {
  const donations: Donation[] = [
    { id: 1, amount: 100, date: "Mar 15, 2024", campaign: "Education Fund", status: "Completed" },
    { id: 2, amount: 50, date: "Mar 1, 2024", campaign: "Community Garden", status: "Completed" },
    { id: 3, amount: 75, date: "Feb 15, 2024", campaign: "Youth Programs", status: "Completed" },
  ];

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
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="py-4 text-sm font-medium text-gray-900">
                    ${donation.amount}
                  </td>
                  <td className="py-4 text-sm text-gray-500">{donation.date}</td>
                  <td className="py-4 text-sm text-gray-500">{donation.campaign}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {donation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationHistory;