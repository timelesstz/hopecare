import React from 'react';
import { CreditCard, Calendar, TrendingUp } from 'lucide-react';

interface RecurringDonationStatsProps {
  stats: {
    totalMonthly: number;
    nextPayment: string;
    totalImpact: number;
  };
}

const RecurringDonationStats: React.FC<RecurringDonationStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Total</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${stats.totalMonthly}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-rose-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Next Payment</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.nextPayment}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-rose-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Impact</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${stats.totalImpact}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-rose-600" />
        </div>
      </div>
    </div>
  );
};

export default RecurringDonationStats;