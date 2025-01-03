import React, { useState } from 'react';
import { CreditCard, Calendar, X, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const recurringDonationSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  frequency: z.enum(['monthly', 'quarterly', 'annually']),
  campaign: z.string().min(1, 'Please select a campaign'),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  startDate: z.string().min(1, 'Please select a start date')
});

type RecurringDonationFormData = z.infer<typeof recurringDonationSchema>;

interface RecurringDonationFormProps {
  onSubmit: (data: RecurringDonationFormData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const RecurringDonationForm: React.FC<RecurringDonationFormProps> = ({
  onSubmit,
  onCancel,
  isProcessing = false
}) => {
  const [showNewCard, setShowNewCard] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RecurringDonationFormData>({
    resolver: zodResolver(recurringDonationSchema),
    defaultValues: {
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const frequency = watch('frequency');
  const amount = watch('amount');

  const calculateImpact = () => {
    if (!amount) return 0;
    switch (frequency) {
      case 'monthly':
        return amount * 12;
      case 'quarterly':
        return amount * 4;
      case 'annually':
        return amount;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Set Up Recurring Donation
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                placeholder="Enter amount"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              {...register('frequency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign
            </label>
            <select
              {...register('campaign')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">Select a campaign</option>
              <option value="general">General Fund</option>
              <option value="education">Education Program</option>
              <option value="health">Health Initiative</option>
              <option value="environment">Environmental Projects</option>
            </select>
            {errors.campaign && (
              <p className="mt-1 text-sm text-red-600">{errors.campaign.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('startDate')}
                type="date"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="flex items-center space-x-4 mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <select
                {...register('paymentMethod')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setShowNewCard(true);
                  }
                }}
              >
                <option value="">Select a payment method</option>
                <option value="card1">Visa ending in 4242</option>
                <option value="card2">Mastercard ending in 5555</option>
                <option value="new">Add new card</option>
              </select>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Annual Impact</h4>
              <p className="text-2xl font-bold text-rose-600">
                ${calculateImpact().toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Your {frequency} donation of ${amount} will provide {calculateImpact()} in support over a year
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⋯</span>
                  Processing...
                </>
              ) : (
                'Set Up Donation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringDonationForm;