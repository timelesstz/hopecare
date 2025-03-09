import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { paymentService } from '@/lib/payment-service';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function DonationProcessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const amount = searchParams.get('amount');
  const projectId = searchParams.get('projectId');
  const tierId = searchParams.get('tierId');
  const donationType = searchParams.get('donationType');
  const { trackDonation } = useAnalytics();

  useEffect(() => {
    const processDonation = async () => {
      if (!amount || !donationType) {
        navigate('/donation?error=invalid_amount');
        return;
      }

      try {
        await paymentService.processPayment({
          amount: Number(amount),
          currency: 'usd',
          projectId: projectId as string,
          tierId: tierId as string,
          donationType: donationType as 'one-time' | 'monthly'
        });

        // Note: We don't need to redirect here as Stripe will handle it
      } catch (error) {
        console.error('Payment processing error:', error);
        navigate('/donation?error=payment_failed');
      }
    };

    processDonation();
  }, [amount, projectId, tierId, donationType, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-medium text-gray-900 mb-2">
          Processing Your Donation
        </h1>
        <p className="text-gray-600">
          Please wait while we redirect you to our secure payment provider...
        </p>
      </div>
    </div>
  );
}
