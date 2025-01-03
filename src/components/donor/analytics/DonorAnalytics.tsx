import React from 'react';
import DonationTrends from './DonationTrends';
import CampaignDistribution from './CampaignDistribution';
import DonationGoals from './DonationGoals';
import { DonationHistory } from '../../../types/donor';

interface DonorAnalyticsProps {
  donations: DonationHistory[];
}

const DonorAnalytics: React.FC<DonorAnalyticsProps> = ({ donations }) => {
  const mockGoals = [
    { campaign: 'Education Fund', target: 5000 },
    { campaign: 'Community Garden', target: 2500 },
    { campaign: 'Youth Programs', target: 3000 }
  ];

  return (
    <div className="space-y-8">
      <DonationTrends donations={donations} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CampaignDistribution donations={donations} />
        <DonationGoals donations={donations} goals={mockGoals} />
      </div>
    </div>
  );
};

export default DonorAnalytics;