import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { paymentService } from '@/lib/payment-service';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function DonationProcessPage() {
  const router = useRouter();
  const { amount, projectId, tierId, donationType } = router.query;
  const { trackDonation } = useAnalytics();

  useEffect(() => {
    const processDonation = async () => {
      if (!amount || !donationType) {
        router.push('/donation?error=invalid_amount');
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
        router.push('/donation?error=payment_failed');
      }
    };

    if (router.isReady) {
      processDonation();
    }
  }, [router.isReady, amount, projectId, tierId, donationType]);

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
