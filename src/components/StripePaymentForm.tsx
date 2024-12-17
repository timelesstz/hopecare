import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, Check, AlertCircle, Loader } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  donationType: 'one-time' | 'monthly' | 'recurring';
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  donationType,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Here you would typically make an API call to your backend
      // to process the payment with the paymentMethod.id

      setSuccess(true);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#6b7280',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h2>
          <p className="text-gray-600">
            {donationType === 'one-time'
              ? 'Make a one-time donation'
              : `Set up your ${donationType} donation`}
          </p>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">You're donating</p>
          <p className="text-2xl font-bold text-gray-900">
            ${amount.toLocaleString()}
            {donationType !== 'one-time' && (
              <span className="text-base font-normal text-gray-500">
                /month
              </span>
            )}
          </p>
        </div>

        {/* Card Input */}
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
          <CardElement options={cardStyle} />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`
            w-full py-3 px-4 rounded-lg
            flex items-center justify-center gap-2
            text-white font-medium
            transition-all duration-200
            ${loading || !stripe
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Complete Donation
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-1">
            <Lock className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
          <p className="mt-1">Your payment information is encrypted and secure.</p>
        </div>
      </form>
    </motion.div>
  );
};

export default StripePaymentForm;