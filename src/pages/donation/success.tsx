import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { CheckCircle, Share2, Heart, ArrowRight } from 'lucide-react';
import { CMSProject } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';
import { paymentService } from '@/lib/payment-service';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DonationDetails {
  amount: number;
  projectId?: string;
  donationType: 'one-time' | 'monthly';
  sessionId: string;
}

export default function DonationSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const { trackDonation } = useAnalytics();
  
  const [verified, setVerified] = useState(false);
  const [project, setProject] = useState<CMSProject | null>(null);
  const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null);

  useEffect(() => {
    // Retrieve donation details from session storage
    const storedDetails = sessionStorage.getItem('donation_details');
    if (storedDetails) {
      setDonationDetails(JSON.parse(storedDetails));
      sessionStorage.removeItem('donation_details'); // Clear after retrieval
    }
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      if (session_id && typeof session_id === 'string') {
        const isVerified = await paymentService.verifyPayment(session_id);
        setVerified(isVerified);

        if (isVerified && donationDetails) {
          // Track successful donation
          trackDonation({
            eventType: 'donation_completed',
            amount: donationDetails.amount,
            currency: 'USD',
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: donationDetails.projectId,
              donationType: donationDetails.donationType,
              sessionId: session_id
            }
          });
        }
      }
    };

    verifyPayment();
  }, [session_id, donationDetails]);

  useEffect(() => {
    // Fetch project details if available
    if (donationDetails?.projectId) {
      const fetchProject = async () => {
        try {
          const projectData = await cmsService.getProjectById(donationDetails.projectId!);
          setProject(projectData);
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      };
      fetchProject();
    }
  }, [donationDetails?.projectId]);

  const handleShare = async () => {
    const shareText = project
      ? `I just donated $${donationDetails?.amount} to support ${project.title}!`
      : `I just made a donation to support a great cause!`;
    
    try {
      await navigator.share({
        title: 'Donation Shared',
        text: shareText,
        url: window.location.origin,
      });

      trackDonation({
        eventType: 'donation_shared',
        amount: donationDetails?.amount || 0,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        metadata: {
          projectId: project?.id,
          donationType: donationDetails?.donationType
        }
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Verifying Your Donation
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your donation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Donation!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your {donationDetails?.donationType === 'monthly' ? 'monthly' : 'one-time'} donation of{' '}
              <span className="font-medium text-gray-900">
                ${donationDetails?.amount}
              </span>{' '}
              has been processed successfully.
            </p>

            {project && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={project.coverImage.url}
                      alt={project.coverImage.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {project.location}
                    </p>
                    <div className="flex items-center gap-1 text-rose-600">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">
                        {project.donorCount} supporters
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={() => router.push('/projects')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                View More Projects
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              A receipt has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
