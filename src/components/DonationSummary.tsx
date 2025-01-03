import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, ArrowRight, Target, Users } from 'lucide-react';

interface DonationSummaryProps {
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  currentGoal?: {
    target: number;
    current: number;
    description: string;
  };
  recentDonors?: Array<{
    name: string;
    amount: number;
    timeAgo: string;
  }>;
}

const DonationSummary: React.FC<DonationSummaryProps> = ({
  amount,
  donationType,
  recurringInterval = 'monthly',
  currentGoal,
  recentDonors,
}) => {
  const calculateAnnualImpact = () => {
    if (donationType === 'one-time') return amount;
    if (donationType === 'monthly') return amount * 12;
    
    switch (recurringInterval) {
      case 'weekly':
        return amount * 52;
      case 'biweekly':
        return amount * 26;
      default:
        return amount * 12;
    }
  };

  const getDonationSchedule = () => {
    if (donationType === 'one-time') return 'One-time donation';
    if (donationType === 'monthly') return 'Monthly donation';
    return \`\${recurringInterval.charAt(0).toUpperCase() + recurringInterval.slice(1)} donation\`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Main Summary */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Donation Summary</h3>
        
        <div className="space-y-4">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Donation Amount</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${amount.toLocaleString()}
              {donationType !== 'one-time' && (
                <span className="text-gray-500 text-sm">
                  /{recurringInterval}
                </span>
              )}
            </span>
          </div>

          {/* Schedule */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-rose-500" />
              <span>Schedule</span>
            </div>
            <span className="font-semibold text-gray-900">
              {getDonationSchedule()}
            </span>
          </div>

          {/* Annual Impact */}
          {donationType !== 'one-time' && (
            <div className="bg-rose-50 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 text-rose-600 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-medium">Annual Impact</span>
              </div>
              <p className="text-gray-600">
                Your support will provide ${calculateAnnualImpact().toLocaleString()} worth of
                healthcare services over the next year
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Goal */}
      {currentGoal && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Current Goal</h4>
            <span className="text-sm text-gray-500">
              ${currentGoal.current.toLocaleString()} of ${currentGoal.target.toLocaleString()}
            </span>
          </div>
          
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: \`\${(currentGoal.current / currentGoal.target) * 100}%\` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-rose-500 rounded-full"
            />
          </div>
          
          <p className="text-sm text-gray-600">{currentGoal.description}</p>
        </div>
      )}

      {/* Recent Donors */}
      {recentDonors && recentDonors.length > 0 && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-rose-500" />
            <h4 className="font-semibold text-gray-900">Recent Supporters</h4>
          </div>
          
          <div className="space-y-4">
            {recentDonors.map((donor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{donor.name}</p>
                  <p className="text-sm text-gray-500">{donor.timeAgo}</p>
                </div>
                <span className="font-medium text-gray-900">
                  ${donor.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="p-6 bg-gray-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-rose-600 text-white rounded-lg font-medium
            flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DonationSummary;
