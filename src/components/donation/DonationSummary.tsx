import React from 'react';
import { CreditCard, CalendarClock, Target } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface DonationSummaryProps {
  amount: number;
  currency: string;
  donationType: 'one-time' | 'monthly';
  projectName?: string;
  paymentMethod?: string;
}

const DonationSummary: React.FC<DonationSummaryProps> = ({
  amount,
  currency,
  donationType,
  projectName,
  paymentMethod
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Donation Summary</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <CreditCard className="h-5 w-5 mr-2" />
            <span>Amount</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatCurrency(amount, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <CalendarClock className="h-5 w-5 mr-2" />
            <span>Type</span>
          </div>
          <span className="font-medium text-gray-900 capitalize">
            {donationType === 'monthly' ? 'Monthly donation' : 'One-time donation'}
          </span>
        </div>

        {projectName && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Target className="h-5 w-5 mr-2" />
              <span>Project</span>
            </div>
            <span className="font-medium text-gray-900">{projectName}</span>
          </div>
        )}

        {paymentMethod && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <CreditCard className="h-5 w-5 mr-2" />
              <span>Payment Method</span>
            </div>
            <span className="font-medium text-gray-900">{paymentMethod}</span>
          </div>
        )}
      </div>

      {donationType === 'monthly' && (
        <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
          Your card will be charged {formatCurrency(amount, currency)} monthly. 
          You can cancel your recurring donation at any time from your account settings.
        </div>
      )}
    </div>
  );
};

export default DonationSummary;
