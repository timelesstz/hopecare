import React, { useState } from 'react';
import { Heart, Gift, Users, Trophy, Sparkles, ArrowRight, Target, Calendar, Repeat } from 'lucide-react';
import DonationTier from '../components/DonationTier';
import CustomDonationInput from '../components/CustomDonationInput';
import { motion } from 'framer-motion';
import { useDonation } from '../context/DonationContext'; 

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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationType, setDonationType] = useState<'one-time' | 'monthly' | 'recurring'>('one-time');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const handleTierSelect = (tierId: string, amount: number) => {
    setSelectedTierId(tierId);
    setSelectedAmount(amount);
    setIsCustomSelected(false);
    setError(null);
  };

  const handleCustomSelect = () => {
    setSelectedTierId(null);
    setSelectedAmount(null);
    setIsCustomSelected(true);
    setError(null);
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

  const handleSuccess = () => {
    setShowSuccessMessage(true);
    setDonationData(null);
    setTimeout(() => {
      setShowSuccessMessage(false);
      // Reset form
      setSelectedTierId(null);
      setSelectedAmount(null);
      setCustomAmount('');
      setIsCustomSelected(false);
      setDonationType('one-time');
    }, 5000);
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

      {/* Payment Form */}
      {((selectedAmount && !error) || (isCustomSelected && customAmount && !error)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Complete Your Donation</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your generosity! Please click the button below to proceed with your donation.
              </p>
              <button
                onClick={handleSuccess}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Complete Donation
              </button>
            </div>
          </div>
        </motion.div>
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