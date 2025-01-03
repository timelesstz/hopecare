import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { DonationHistory } from '../../../types/donor';
import { formatCurrency } from '../../../utils/donorUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DonationTrendsProps {
  donations: DonationHistory[];
  period?: 'month' | 'year';
}

const DonationTrends: React.FC<DonationTrendsProps> = ({ donations, period = 'month' }) => {
  const processData = () => {
    const sortedDonations = [...donations].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedDonations.map(d => new Date(d.date).toLocaleDateString());
    const amounts = sortedDonations.map(d => d.amount);
    const cumulative = amounts.reduce((acc, curr, i) => 
      [...acc, (acc[i - 1] || 0) + curr], [] as number[]
    );

    return { labels, amounts, cumulative };
  };

  const { labels, amounts, cumulative } = processData();

  const data = {
    labels,
    datasets: [
      {
        label: 'Individual Donations',
        data: amounts,
        borderColor: 'rgb(225, 29, 72)',
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        tension: 0.4
      },
      {
        label: 'Cumulative Total',
        data: cumulative,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Donation History Trends'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Line data={data} options={options} />
    </div>
  );
};

export default DonationTrends;