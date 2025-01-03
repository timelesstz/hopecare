import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { DonationHistory } from '../../../types/donor';
import { formatCurrency } from '../../../utils/donorUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CampaignDistributionProps {
  donations: DonationHistory[];
}

const CampaignDistribution: React.FC<CampaignDistributionProps> = ({ donations }) => {
  const processData = () => {
    const campaignTotals = donations.reduce((acc, donation) => {
      acc[donation.campaign] = (acc[donation.campaign] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(campaignTotals),
      data: Object.values(campaignTotals)
    };
  };

  const { labels, data } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(225, 29, 72, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(225, 29, 72, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Distribution</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CampaignDistribution;