import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Share2 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { useDonation } from '../../context/DonationContext';
import { formatCurrency } from '../../lib/utils';

const DonationSuccess = () => {
  const navigate = useNavigate();
  const { trackDonationEvent } = useAnalytics();
  const { user } = useFirebaseAuth();
  const { donationData, clearDonation } = useDonation();

  useEffect(() => {
    if (!donationData) {
      navigate('/donate');
      return;
    }

    trackDonationEvent({
      eventType: 'donation_completed',
      amount: donationData.amount,
      currency: donationData.currency,
      userId: user?.uid,
      metadata: {
        donationType: donationData.donationType,
        projectId: donationData.projectId,
        projectName: donationData.projectName
      }
    });

    // Cleanup donation data after tracking
    return () => {
      clearDonation();
    };
  }, [donationData, navigate, trackDonationEvent, user, clearDonation]);

  const handleShare = async () => {
    if (!donationData) return;

    const shareText = donationData.projectId
      ? `I just supported ${donationData.projectName} through HopeCare! Join me in making a difference.`
      : 'I just donated to HopeCare! Join me in supporting this great cause.';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Donation to HopeCare',
          text: shareText,
          url: window.location.origin
        });

        trackDonationEvent({
          eventType: 'donation_shared',
          amount: donationData.amount,
          currency: donationData.currency,
          userId: user?.uid,
          metadata: {
            platform: 'web_share',
            projectId: donationData.projectId,
            projectName: donationData.projectName
          }
        });
      } catch (error) {
        // User cancelled or share failed
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = encodeURIComponent(window.location.origin);
      const text = encodeURIComponent(shareText);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  if (!donationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Thank you for your donation!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your {donationData.donationType === 'monthly' ? 'monthly' : 'one-time'} contribution of{' '}
              {formatCurrency(donationData.amount, donationData.currency)} will help make a difference.
            </p>
            {donationData.projectName && (
              <p className="mt-2 text-sm text-rose-600">
                Supporting: {donationData.projectName}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleShare}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
