import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Share2, Heart, ArrowRight, Calendar, Download } from 'lucide-react';
import { useDonation } from '../../context/DonationContext';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const DonationSuccess = () => {
  const { donationData, clearDonation } = useDonation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If no donation data, redirect to donation page
    if (!donationData) {
      navigate('/donate');
    }

    // Clear donation data when component unmounts
    return () => {
      // Wait a bit before clearing to ensure data is available for the page
      setTimeout(() => {
        clearDonation();
      }, 5000);
    };
  }, [donationData, navigate, clearDonation]);

  const handleShare = async () => {
    const shareText = donationData?.project
      ? `I just donated ${formatCurrency(donationData.amount, donationData.currency)} to support ${donationData.project}!`
      : `I just made a donation to support HopeCare Tanzania!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Donation Shared',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!donationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Loading Donation Information
          </h1>
          <p className="text-gray-600">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  const isRecurring = donationData.donationType === 'monthly' || donationData.donationType === 'recurring';
  const donationDate = new Date(donationData.date);
  const formattedDate = donationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Donation!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your {isRecurring ? 'recurring' : 'one-time'} donation of{' '}
              <span className="font-medium text-gray-900">
                {formatCurrency(donationData.amount, donationData.currency)}
              </span>{' '}
              has been processed successfully.
            </p>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-sm text-gray-500">Donation Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(donationData.amount, donationData.currency)}
                    {isRecurring && <span className="text-sm text-gray-500 ml-1">/month</span>}
                  </p>
                </div>
                
                <div className="text-left">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                </div>
                
                {donationData.project && (
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="text-lg font-semibold text-gray-900">{donationData.project}</p>
                  </div>
                )}
                
                <div className="text-left">
                  <p className="text-sm text-gray-500">Donation Type</p>
                  <div className="flex items-center">
                    {isRecurring ? (
                      <>
                        <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">Recurring</span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">One-time</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                type="button"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              
              <button
                onClick={() => navigate('/projects')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                type="button"
              >
                View Projects
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {user ? (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  You can view your donation history in your account dashboard.
                </p>
                <button
                  onClick={() => navigate('/donor/dashboard')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  type="button"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Create an account to manage your donations and get updates.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  type="button"
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500 mb-2">
                A receipt has been sent to your email address.
              </p>
              <button
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                type="button"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
