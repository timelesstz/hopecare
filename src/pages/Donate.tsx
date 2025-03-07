import React, { useState } from 'react';
import { Heart, Gift, Users, Trophy, Sparkles, ArrowRight, Target, Calendar, Repeat } from 'lucide-react';
import DonationTier from '../components/DonationTier';
import CustomDonationInput from '../components/CustomDonationInput';
import { motion } from 'framer-motion';
import { useDonation } from '../context/DonationContext';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { initializePayment, handlePaymentCallback } from '../services/payment';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import PaymentErrorRecovery from '../components/PaymentErrorRecovery';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { analytics } from '../lib/analytics-firebase';
import { useNavigate } from 'react-router-dom';

const DONATION_TIERS = [
  {
    id: 'friend',
    name: 'Friend',
    amount: 25,
    description: 'Support essential healthcare services',
    benefits: [
      'Monthly impact newsletter',
      'Digital thank you certificate',
      'Name on donor wall',
    ],
    icon: 'heart',
    impact: 'Provides medical supplies for 5 patients',
    popular: false
  },
  {
    id: 'supporter',
    name: 'Supporter',
    amount: 50,
    description: 'Help expand our community programs',
    benefits: [
      'All Friend benefits',
      'Quarterly virtual meetups',
      'Exclusive content access',
      'Personal impact report',
    ],
    icon: 'users',
    popular: true,
    impact: 'Funds a community health workshop'
  },
  {
    id: 'champion',
    name: 'Champion',
    amount: 100,
    description: 'Make a lasting impact on healthcare',
    benefits: [
      'All Supporter benefits',
      'VIP event invitations',
      'One-on-one consultation',
      'Recognition plaque',
      'Annual gala dinner invite',
    ],
    icon: 'star',
    impact: 'Sponsors healthcare for an entire family',
    popular: false
  },
];

const IMPACT_METRICS = [
  {
    number: '5,000+',
    label: 'Lives Impacted',
    description: 'Direct beneficiaries of our healthcare programs',
    icon: <Users className="w-8 h-8 text-blue-500" />,
  },
  {
    number: '24/7',
    label: 'Healthcare Access',
    description: 'Round-the-clock medical support and guidance',
    icon: <Target className="w-8 h-8 text-green-500" />,
  },
  {
    number: '95%',
    label: 'Success Rate',
    description: 'Of donations directly support our programs',
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
  },
];

const DONATION_TYPES = [
  {
    id: 'one-time',
    title: 'One-time',
    icon: <Gift className="w-5 h-5" />,
    description: 'Make a single donation',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Support us every month',
  },
  {
    id: 'recurring',
    title: 'Custom Recurring',
    icon: <Repeat className="w-5 h-5" />,
    description: 'Choose your frequency',
  },
];

const Donate = () => {
  const { setDonationData } = useDonation();
  const { user } = useFirebaseAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationType, setDonationType] = useState<'one-time' | 'monthly' | 'recurring'>('one-time');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<{
    type: 'initialization' | 'processing' | 'verification' | 'cancelled' | 'unknown';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleTierSelect = (tierId: string, amount: number) => {
    setSelectedTierId(tierId);
    setSelectedAmount(amount);
    setIsCustomSelected(false);
    setError(null);
    setPaymentError(null);
  };

  const handleCustomSelect = () => {
    setSelectedTierId(null);
    setSelectedAmount(null);
    setIsCustomSelected(true);
    setError(null);
    setPaymentError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (numValue < 1) {
      setError('Minimum donation amount is $1');
    } else if (numValue > 50000) {
      setError('Maximum donation amount is $50,000');
    } else {
      setError(null);
    }
  };

  const handleSuccess = async (paymentData: any) => {
    try {
      // Store donation in database
      const donationData = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        type: donationType === 'monthly' ? 'monthly' : 'one-time',
        status: 'completed',
        payment_method: paymentData.payment_method || 'card',
        donor_id: user?.id,
        donor_name: user?.displayName || 'Anonymous',
        donor_email: user?.email,
        project_id: selectedProject?.id,
        created_at: new Date().toISOString(),
      };
      
      // Add donation to Firestore
      await addDoc(collection(db, 'donations'), donationData);
      
      // Update UI
      setDonationData({
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        date: new Date().toISOString(),
        project: selectedProject?.name || 'General Fund',
      });
      
      // Track donation in analytics
      analytics.trackDonation({
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        project_id: selectedProject?.id,
        donation_type: donationType === 'monthly' ? 'monthly' : 'one-time',
        payment_method: paymentData.payment_method || 'card',
      });
      
      // Navigate to success page
      navigate('/donation/success');
    } catch (error) {
      console.error('Error storing donation:', error);
      setError('Failed to record donation. Please contact support.');
    }
  };

  const handleDonation = async () => {
    if (!user) {
      setError('Please log in to make a donation');
      return;
    }

    const amount = isCustomSelected ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 1) {
      setError('Please select or enter a valid donation amount');
      return;
    }

    // Clear any previous errors
    setError(null);
    setPaymentError(null);

    const config = initializePayment({
      amount,
      email: user.email,
      name: user.name,
    });

    try {
      const flutterwave = useFlutterwave(config);
      
      flutterwave({
        callback: async (response) => {
          closePaymentModal();
          if (response.status === 'successful') {
            try {
              const verificationResult = await handlePaymentCallback(response);
              if (verificationResult.status === 'complete') {
                // Pass payment data to handleSuccess
                await handleSuccess({
                  amount,
                  transaction_id: response.transaction_id,
                  tx_ref: response.tx_ref,
                  currency: 'USD',
                });
              } else {
                setPaymentError({
                  type: 'verification',
                  message: 'Your payment was processed, but we could not verify it. Reference: ' + response.transaction_id
                });
              }
            } catch (error) {
              setPaymentError({
                type: 'verification',
                message: error instanceof Error ? error.message : 'Unknown verification error'
              });
            }
          } else {
            setPaymentError({
              type: 'processing',
              message: `Payment was not successful. Status: ${response.status}`
            });
          }
        },
        onClose: () => {
          setPaymentError({
            type: 'cancelled',
            message: 'You cancelled the payment process'
          });
        },
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError({
        type: 'initialization',
        message: error instanceof Error ? error.message : 'Failed to initialize payment'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Make a <span className="text-blue-600">Difference</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your donation helps us provide essential healthcare services to those in need.
              Together, we can create a healthier future for Tanzania.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {IMPACT_METRICS.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  {metric.icon}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metric.number}</p>
                    <p className="text-lg font-medium text-gray-600">{metric.label}</p>
                    <p className="mt-2 text-sm text-gray-500">{metric.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Type Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DONATION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setDonationType(type.id as any)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                donationType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                donationType === type.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {type.icon}
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-medium text-gray-900">{type.title}</h3>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Donation Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {DONATION_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DonationTier
                tier={tier}
                isSelected={selectedTierId === tier.id}
                onSelect={() => handleTierSelect(tier.id, tier.amount)}
                donationType={donationType === 'recurring' ? 'monthly' : donationType}
              />
            </motion.div>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mt-8">
          <CustomDonationInput
            value={customAmount}
            onChange={handleCustomAmountChange}
            onSelect={handleCustomSelect}
            selected={isCustomSelected}
            error={error}
          />
        </div>
      </div>

      {/* Payment Error Recovery */}
      {paymentError && (
        <div className="max-w-md mx-auto my-8">
          <PaymentErrorRecovery
            errorType={paymentError.type}
            errorMessage={paymentError.message}
            onRetry={() => {
              setPaymentError(null);
              handleDonation();
            }}
          />
        </div>
      )}

      {/* Add Payment Button */}
      {!paymentError && (
        <div className="mt-8 text-center">
          <button
            onClick={handleDonation}
            disabled={!selectedAmount && !isCustomSelected || !!error}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (!selectedAmount && !isCustomSelected) || error
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            Proceed to Donate
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          Thank you for your donation! You're making a difference.
        </motion.div>
      )}

      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Trusted by Organizations Worldwide</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Add partner/certification logos here */}
          </div>
          <p className="mt-8 text-gray-500">
            Your donation is secure and tax-deductible. We're committed to transparency
            and responsible use of funds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Donate;