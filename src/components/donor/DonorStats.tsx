import React from 'react';
import { CreditCard, Clock, BarChart2 } from 'lucide-react';

interface DonorStat {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface DonorStatsProps {
  donationTotal?: number;
  donationCount?: number;
}

const DonorStats: React.FC<DonorStatsProps> = ({ donationTotal = 0, donationCount = 0 }) => {
  // Calculate impact score based on donation total and count
  const impactScore = Math.floor(donationTotal * 0.5 + donationCount * 100);
  
  // Calculate monthly average (assuming donations over 12 months)
  const monthlyAverage = donationTotal > 0 ? donationTotal / 12 : 0;

  const stats: DonorStat[] = [
    { label: "Total Donated", value: `$${donationTotal.toLocaleString()}`, icon: CreditCard },
    { label: "Monthly Average", value: `$${monthlyAverage.toFixed(2)}`, icon: Clock },
    { label: "Impact Score", value: impactScore.toString(), icon: BarChart2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className="h-8 w-8 text-rose-600" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonorStats;