import React from 'react';
import { Calendar, CreditCard, ArrowDownload } from 'lucide-react';

interface DonationRecord {
  id: string;
  date: string;
  amount: number;
  campaign: string;
  status: string;
  paymentMethod: string;
}

const RecurringDonationHistory: React.FC = () => {
  const history: DonationRecord[] = [
    {
      id: '1',
      date: '2024-03-15',
      amount: 25,
      campaign: 'General Fund',
      status: 'completed',
      paymentMethod: '**** 4242'
    },
    {
      id: '2',
      date: '2024-02-15',
      amount: 25,
      campaign: 'General Fund',
      status: 'completed',
      paymentMethod: '**** 4242'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-medium text-gray-900">Payment History</h4>
        <button className="text-rose-600 hover:text-rose-700 flex items-center">
          <ArrowDownload className="h-4 w-4 mr-2" />
          Download History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-500">
              <th className="pb-4">Date</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4">Campaign</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Payment Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((record) => (
              <tr key={record.id}>
                <td className="py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-sm font-medium text-gray-900">
                    ${record.amount}
                  </span>
                </td>
                <td className="py-4">
                  <span className="text-sm text-gray-600">{record.campaign}</span>
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {record.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                    {record.paymentMethod}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecurringDonationHistory;