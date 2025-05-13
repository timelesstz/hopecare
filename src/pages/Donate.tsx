import { useState, useEffect } from 'react';
import { Gift, Users, Sparkles, ArrowRight, Target, Calendar, Repeat, User, Shield, CheckCircle } from 'lucide-react';
import DonationTier from '../components/DonationTier';
import CustomDonationInput from '../components/CustomDonationInput';
import { motion } from 'framer-motion';
import { useDonation } from '../context/DonationContext';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { handlePaymentCallback } from '../services/payment';
import { useAuth } from '../contexts/AuthContext';
import PaymentErrorRecovery from '../components/PaymentErrorRecovery';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { analyticsService } from '../firebase/analytics';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Checkbox, FormControlLabel, Divider, Alert, Stepper, Step, StepLabel, Avatar } from '@mui/material';

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

// Testimonials from donors
const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    role: "Monthly Donor",
    quote: "I've been donating monthly for a year now, and I love seeing the updates about how my contributions are making a difference in people's lives."
  },
  {
    name: "Michael Thompson",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    role: "Champion Donor",
    quote: "As someone who has seen healthcare challenges firsthand, I know how important HopeCare's work is. Proud to support this amazing organization."
  },
  {
    name: "Amina Patel",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    role: "Volunteer & Donor",
    quote: "I started as a donor and was so impressed that I became a volunteer too. The impact they're making is real and tangible."
  }
];

// Partner logos for trust indicators
const PARTNERS = [
  { name: "World Health Organization", logo: "https://via.placeholder.com/120x40" },
  { name: "UNICEF", logo: "https://via.placeholder.com/120x40" },
  { name: "Gates Foundation", logo: "https://via.placeholder.com/120x40" },
  { name: "Tanzania Health Ministry", logo: "https://via.placeholder.com/120x40" }
];

// Impact calculator data
const IMPACT_CALCULATOR = [
  { amount: 25, impact: "Provides medical supplies for 5 patients" },
  { amount: 50, impact: "Funds a community health workshop" },
  { amount: 100, impact: "Sponsors healthcare for an entire family" },
  { amount: 250, impact: "Supplies essential equipment for rural clinics" },
  { amount: 500, impact: "Trains healthcare workers in a community" },
  { amount: 1000, impact: "Helps establish a mobile health clinic" }
];

const Donate = () => {
  const { setDonationData } = useDonation();
  const { user } = useAuth();
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
  
  // Guest donation fields
  const [isGuestDonation, setIsGuestDonation] = useState(!user);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNameError, setGuestNameError] = useState('');
  const [guestEmailError, setGuestEmailError] = useState('');
  const [createAccount, setCreateAccount] = useState(false);

  // Step indicator for donation flow
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Choose Amount", "Your Information", "Payment"];

  // Impact message based on current amount
  const [impactMessage, setImpactMessage] = useState<string>("");

  // Fundraising goal progress
  const fundraisingGoal = 50000;  // $50,000
  const raisedSoFar = 32450;      // $32,450
  const percentComplete = (raisedSoFar / fundraisingGoal) * 100;

  // Update custom amount when a tier is selected
  useEffect(() => {
    if (selectedTierId) {
      const tier = DONATION_TIERS.find(t => t.id === selectedTierId);
      if (tier) {
        setCustomAmount(tier.amount.toString());
        updateImpactMessage(tier.amount);
      }
    }
  }, [selectedTierId]);

  // Update impact message when custom amount changes
  useEffect(() => {
    if (customAmount) {
      const amount = parseFloat(customAmount);
      if (!isNaN(amount)) {
        updateImpactMessage(amount);
      }
    }
  }, [customAmount]);

  const updateImpactMessage = (amount: number) => {
    // Find the highest impact that is less than or equal to the amount
    const impact = IMPACT_CALCULATOR
      .filter(item => item.amount <= amount)
      .sort((a, b) => b.amount - a.amount)[0];
    
    if (impact) {
      setImpactMessage(impact.impact);
    } else if (amount > 0) {
      setImpactMessage("Every dollar contributes to our healthcare mission");
    } else {
      setImpactMessage("");
    }
  };

  const handleTierSelect = (tierId: string, amount: number) => {
    setSelectedTierId(tierId);
    setSelectedAmount(amount);
    setCustomAmount(amount.toString()); // Set the custom amount field to match the tier amount
    setIsCustomSelected(false);
    setError(null);
    setPaymentError(null);
    updateImpactMessage(amount);
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

  const validateGuestFields = () => {
    let isValid = true;
    
    if (!guestName.trim()) {
      setGuestNameError('Name is required');
      isValid = false;
    } else {
      setGuestNameError('');
    }
    
    if (!guestEmail.trim()) {
      setGuestEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(guestEmail)) {
      setGuestEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setGuestEmailError('');
    }
    
    return isValid;
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
        donor_id: user?.id || 'guest',
        donor_name: user?.user_metadata?.display_name || guestName || 'Anonymous',
        donor_email: user?.email || guestEmail || 'anonymous@example.com',
        donor_phone: guestPhone || '',
        is_guest: isGuestDonation,
        create_account: isGuestDonation && createAccount,
        created_at: new Date().toISOString(),
      };
      
      // Add donation to Firestore
      // Store donation in Firestore
      const docRef = await addDoc(collection(db, 'donations'), donationData);
      
      // Update UI
      setDonationData({
        amount: parseFloat(customAmount),
        currency: 'USD',
        date: new Date().toISOString(),
        project: 'General Fund'
      });
      
      // Track donation in analytics
      analyticsService.trackDonation({
        amount: paymentData.amount,
        currency: 'USD',
        donation_type: donationType === 'monthly' ? 'monthly' : 'one-time',
        payment_method: 'flutterwave'
      });
      
      // Navigate to success page
      navigate('/donation/success');
    } catch (error) {
      console.error('Error storing donation:', error);
      setError('Failed to record donation. Please contact support.');
    }
  };

  // Initialize Flutterwave payment config at the component level
  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLUTTERWAVE_PUBLIC_KEY',
    tx_ref: Date.now().toString(),
    amount: parseFloat(customAmount) || 0,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || guestEmail || 'guest@example.com',
      phone_number: user?.phone || guestPhone || '0000000000', // Required by Flutterwave
      name: user?.user_metadata?.display_name || guestName || 'Guest Donor',
    },
    customizations: {
      title: 'HopeCare Donation',
      description: 'Supporting healthcare initiatives in Tanzania',
      logo: 'https://hopecaretz.org/logo.png',
    },
  };

  // Use the hook at the component level
  const handleFlutterPayment = useFlutterwave(config);

  const handleDonation = async () => {
    // Determine the amount from either custom input or selected tier
    const amount = parseFloat(customAmount);
    if (!amount || amount < 1) {
      setError('Please select or enter a valid donation amount');
      return;
    }

    // Validate guest fields if donating as guest
    if (isGuestDonation && !validateGuestFields()) {
      return;
    }

    // Move to next step if we're in step flow, otherwise process payment
    if (activeStep < steps.length - 1) {
      setActiveStep(prevStep => prevStep + 1);
      return;
    }

    // Clear any previous errors
    setError(null);
    setPaymentError(null);

    // Update the Flutterwave config with current values
    // No need to create a new config, we'll use the existing handleFlutterPayment

    try {
      // Use the pre-initialized payment handler
      handleFlutterPayment({
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

  // Moving back in the step flow
  const handleBack = () => {
    setActiveStep(prevStep => Math.max(0, prevStep - 1));
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
              Make a <span className="text-rose-600">Difference</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your donation helps us provide essential healthcare services to those in need.
              Together, we can create a healthier future for Tanzania.
            </p>
            
            {/* Fundraising Progress Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-700">${raisedSoFar.toLocaleString()} raised</span>
                <span className="text-gray-500">Goal: ${fundraisingGoal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-rose-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(percentComplete, 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Help us reach our fundraising goal by donating today!
              </p>
            </div>
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

      {/* Donation Form Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {activeStep === 0 && (
          <>
            {/* Donation Type Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How would you like to donate?</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {DONATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDonationType(type.id as any)}
                    className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                      donationType === type.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      donationType === type.id ? 'bg-rose-100' : 'bg-gray-100'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a donation amount</h2>
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
                donationType={donationType === 'recurring' ? 'monthly' : donationType}
              />
            </div>

            {/* Impact Message */}
            {impactMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Your Impact</h3>
                    <p className="mt-1 text-sm text-green-700">{impactMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeStep === 1 && (
          <>
            {/* Guest Donation Form or User Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
              
              {!user && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Already have an account?</span>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/login')}
                        sx={{ 
                          borderColor: '#be123c', 
                          color: '#be123c',
                          '&:hover': { borderColor: '#9f1239', color: '#9f1239' }
                        }}
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <TextField
                      label="Full Name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      error={!!guestNameError}
                      helperText={guestNameError}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Email Address"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      error={!!guestEmailError}
                      helperText={guestEmailError}
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div className="mb-4">
                    <TextField
                      label="Phone Number (Optional)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      fullWidth
                    />
                  </div>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        sx={{
                          color: '#be123c',
                          '&.Mui-checked': {
                            color: '#be123c',
                          },
                        }}
                      />
                    }
                    label="Create an account to manage your donations"
                  />
                </>
              )}
              
              {user && (
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Donating as</h3>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Donation Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Summary</h3>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${customAmount || '0'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{donationType} donation</span>
              </div>
              {impactMessage && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Impact:</span>
                  <span className="font-medium text-green-700">{impactMessage}</span>
                </div>
              )}
            </div>
          </>
        )}

        {activeStep === 2 && (
          <>
            {/* Payment Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
              
              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Donation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${customAmount || '0'} {donationType === 'monthly' && '/month'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{donationType} donation</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Donor:</span>
                    <span className="font-medium">{user ? user.email : guestName || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
              
              {/* Security Message */}
              <div className="mb-6 flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Shield className="h-5 w-5 text-blue-500 mr-3" />
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </p>
              </div>
            </div>
          </>
        )}

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

        {/* Navigation and Submit Buttons */}
        {!paymentError && (
          <div className="max-w-md mx-auto mt-8 mb-16 flex justify-between">
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleDonation}
              disabled={(!customAmount || parseFloat(customAmount) < 1 || !!error)}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${
                (!customAmount || parseFloat(customAmount) < 1 || !!error)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {activeStep < steps.length - 1 ? 'Continue' : `Donate $${customAmount || '0'} ${donationType === 'monthly' && '/month'}`}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Trusted By</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {PARTNERS.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center">
                <img src={partner.logo} alt={partner.name} className="h-10 grayscale hover:grayscale-0 transition-all" />
                <span className="text-xs text-gray-500 mt-2">{partner.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-xs text-gray-500">Secure Payment</span>
            </div>
            <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 ml-4">
              <CheckCircle className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-xs text-gray-500">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-rose-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Others Donate</h2>
            <p className="mt-4 text-lg text-gray-600">
              Read what our community of donors has to say about supporting HopeCare
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{ width: 48, height: 48 }}
                  />
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-rose-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;