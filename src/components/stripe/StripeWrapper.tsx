import { FC, useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { useDonation } from '../../context/DonationContext';

export const StripeWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { donationData } = useDonation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    stripePromise.catch(err => {
      setError('Failed to load payment system. Please try again later.');
      console.error('Stripe initialization error:', err);
    });
  }, []);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  // Only render Elements when we have a valid amount
  if (!donationData?.amount || donationData.amount <= 0) {
    return <>{children}</>;
  }
  
  const stripeOptions = {
    mode: 'payment' as const,
    currency: 'usd',
    amount: donationData.amount,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#10B981',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      {children}
    </Elements>
  );
};
