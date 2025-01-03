import React from 'react';
import { CreditCard, Clock, Edit2, Trash2 } from 'lucide-react';

interface RecurringDonation {
  id: number;
  amount: number;
  frequency: string;
  campaign: string;
  nextDate: string;
  card: string;
}

const RecurringDonations: React.FC = () => {
  const donations: RecurringDonation[] = [
    {
      id: 1,
      amount: 25,
      frequency: "Monthly",
      campaign: "General Fund",
      nextDate: "Apr 1, 2024",
      card: "**** 4242",
    },
    {
      id: 2,
      amount: 50,
      frequency: "Monthly",
      campaign: "Education Initiative",
      nextDate: "Apr 15, 2024",
      card: "**** 5555",
    },
  ];

  return (
    <div className="space-y-6">
      {donations.map((donation) => (
        <div key={donation.id} className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                ${donation.amount} {donation.frequency}
              </h4>
              <p className="text-gray-600">{donation.campaign}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-rose-600">
                <Edit2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-rose-600">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              {donation.card}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Next payment: {donation.nextDate}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecurringDonations;