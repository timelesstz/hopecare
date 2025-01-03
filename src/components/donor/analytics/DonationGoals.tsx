import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DonationHistory } from '../../../types/donor';
import { formatCurrency } from '../../../utils/donorUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DonationGoalsProps {
  donations: DonationHistory[];
  goals: {
    campaign: string;
    target: number;
  }[];
}

const DonationGoals: React.FC<DonationGoalsProps> = ({ donations, goals }) => {
  const processData = () => {
    const campaignTotals = donations.reduce((acc, donation) => {
      acc[donation.campaign] = (acc[donation.campaign] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);

    return goals.map(goal => ({
      campaign: goal.campaign,
      current: campaignTotals[goal.campaign] || 0,
      target: goal.target,
      percentage: ((campaignTotals[goal.campaign] || 0) / goal.target) * 100
    }));
  };

  const data = processData();

  const chartData = {
    labels: data.map(d => d.campaign),
    datasets: [
      {
        label: 'Current',
        data: data.map(d => d.current),
        backgroundColor: 'rgba(225, 29, 72, 0.8)',
        borderColor: 'rgba(225, 29, 72, 1)',
        borderWidth: 1
      },
      {
        label: 'Target',
        data: data.map(d => d.target),
        backgroundColor: 'rgba(209, 213, 219, 0.5)',
        borderColor: 'rgba(209, 213, 219, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Goals</h3>
      <Bar data={chartData} options={options} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.campaign} className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900">{item.campaign}</h4>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(item.current)}</span>
                <span>{formatCurrency(item.target)}</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {item.percentage.toFixed(1)}% of goal
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationGoals;