import { CreditCard, Calendar, Edit2, Trash2, PauseCircle, PlayCircle, TrendingUp } from 'lucide-react';

interface RecurringDonationProps {
  donation: {
    id: string;
    amount: number;
    frequency: string;
    campaign: string;
    nextDate: string;
    card: string;
    status: string;
    startDate: string;
    totalDonated: number;
  };
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

const RecurringDonationCard = ({
  donation,
  onEdit,
  onCancel
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              ${donation.amount}
            </span>
            <span className="ml-2 text-gray-600">/ {donation.frequency}</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mt-1">
            {donation.campaign}
          </h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
          {donation.status}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-5 w-5 mr-2" />
          Next payment: {donation.nextDate}
        </div>
        <div className="flex items-center text-gray-600">
          <CreditCard className="h-5 w-5 mr-2" />
          {donation.card}
        </div>
        <div className="flex items-center text-gray-600">
          <TrendingUp className="h-5 w-5 mr-2" />
          Total donated: ${donation.totalDonated}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => onEdit(donation.id)}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </button>
          {donation.status === 'active' ? (
            <button className="text-yellow-600 hover:text-yellow-700 flex items-center">
              <PauseCircle className="h-4 w-4 mr-1" />
              Pause
            </button>
          ) : donation.status === 'paused' ? (
            <button className="text-green-600 hover:text-green-700 flex items-center">
              <PlayCircle className="h-4 w-4 mr-1" />
              Resume
            </button>
          ) : null}
        </div>
        <button
          onClick={() => onCancel(donation.id)}
          className="text-rose-600 hover:text-rose-700 flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RecurringDonationCard;