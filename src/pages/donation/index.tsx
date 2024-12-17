import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Heart, ArrowLeft } from 'lucide-react';
import { CMSProject, CMSDonationTier } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';
import { DonationTier } from '@/components/DonationTier';
import { CustomDonationInput } from '@/components/CustomDonationInput';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DonationPageProps {
  defaultTiers: CMSDonationTier[];
}

export default function DonationPage({ defaultTiers }: DonationPageProps) {
  const router = useRouter();
  const { projectId, tierId } = router.query;
  const { trackDonation } = useAnalytics();

  const [project, setProject] = useState<CMSProject | null>(null);
  const [selectedTier, setSelectedTier] = useState<CMSDonationTier | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [loading, setLoading] = useState(false);

  // Fetch project details if projectId is provided
  useEffect(() => {
    if (projectId && typeof projectId === 'string') {
      const fetchProject = async () => {
        try {
          const projectData = await cmsService.getProjectById(projectId);
          setProject(projectData);
        } catch (error) {
          console.error('Error fetching project:', error);
          // Handle error (e.g., show toast notification)
        }
      };
      fetchProject();
    }
  }, [projectId]);

  // Set initial selected tier if tierId is provided
  useEffect(() => {
    if (tierId && typeof tierId === 'string') {
      const tier = project?.donationTiers?.find(t => t.id === tierId) || 
                  defaultTiers.find(t => t.id === tierId);
      if (tier) {
        setSelectedTier(tier);
      }
    }
  }, [tierId, project, defaultTiers]);

  const handleDonationSubmit = async () => {
    setLoading(true);
    try {
      const amount = selectedTier?.amount || customAmount;
      
      // Track donation attempt
      trackDonation({
        eventType: 'donation_initiated',
        amount,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        metadata: {
          projectId: project?.id,
          tierId: selectedTier?.id,
          donationType,
          isCustomAmount: !selectedTier
        }
      });

      // Redirect to payment processing
      router.push({
        pathname: '/donation/process',
        query: {
          amount,
          projectId: project?.id,
          tierId: selectedTier?.id,
          donationType,
        }
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      // Handle error (e.g., show toast notification)
    } finally {
      setLoading(false);
    }
  };

  const tiers = project?.donationTiers || defaultTiers;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project ? `Support ${project.title}` : 'Make a Donation'}
              </h1>
              <p className="text-gray-600">
                {project
                  ? project.description
                  : 'Choose an amount to donate and help make a difference.'}
              </p>
            </div>

            {/* Project Preview (if applicable) */}
            {project && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={project.coverImage.url}
                      alt={project.coverImage.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.location}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      {project.donorCount} donors have contributed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Donation Type Selection */}
            <div className="mb-8">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setDonationType('one-time')}
                  className={`
                    flex-1 max-w-[200px] py-2 px-4 rounded-lg text-sm font-medium
                    ${donationType === 'one-time'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  One-time Donation
                </button>
                <button
                  onClick={() => setDonationType('monthly')}
                  className={`
                    flex-1 max-w-[200px] py-2 px-4 rounded-lg text-sm font-medium
                    ${donationType === 'monthly'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  Monthly Donation
                </button>
              </div>
            </div>

            {/* Donation Tiers */}
            <div className="space-y-4 mb-8">
              {tiers.map((tier) => (
                <DonationTier
                  key={tier.id}
                  tier={tier}
                  isSelected={selectedTier?.id === tier.id}
                  onSelect={() => {
                    setSelectedTier(tier);
                    setCustomAmount(0);
                  }}
                  donationType={donationType}
                />
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mb-8">
              <CustomDonationInput
                value={customAmount}
                onChange={(amount) => {
                  setCustomAmount(amount);
                  setSelectedTier(null);
                }}
                disabled={loading}
              />
            </div>

            {/* Donation Button */}
            <button
              onClick={handleDonationSubmit}
              disabled={loading || (!selectedTier && !customAmount)}
              className={`
                w-full py-3 rounded-lg font-medium
                ${(!selectedTier && !customAmount) || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
                }
              `}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const defaultTiers = await cmsService.getDonationTiers();
    
    return {
      props: {
        defaultTiers,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching default tiers:', error);
    return {
      props: {
        defaultTiers: [],
      },
      revalidate: 60,
    };
  }
}
