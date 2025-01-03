import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface DonationRecord {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  projectName?: string;
  donationType: 'one-time' | 'monthly';
  receiptUrl?: string;
}

interface DonationHistoryProps {
  donations: DonationRecord[];
  isLoading?: boolean;
}

const DonationHistory: React.FC<DonationHistoryProps> = ({ donations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your donation history will appear here once you make your first contribution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Donation History</h2>
      
      <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Date
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Amount
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Project
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {donations.map((donation) => (
              <tr key={donation.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                  {formatDate(donation.date)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {formatCurrency(donation.amount, donation.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                  {donation.donationType}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {donation.projectName || 'General Fund'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      donation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : donation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {donation.receiptUrl && (
                    <a
                      href={donation.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-900"
                    >
                      <Download className="h-5 w-5" />
                      <span className="sr-only">Download receipt</span>
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationHistory;
