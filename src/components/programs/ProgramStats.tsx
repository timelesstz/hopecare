import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Users, Heart, Target } from 'lucide-react';
import StatCard from './stats/StatCard';

interface ProgramStatsProps {
  stats: {
    totalBeneficiaries: number;
    activeCases: number;
    successRate: number;
    locations: number;
  };
}

const ProgramStats: React.FC<ProgramStatsProps> = ({ stats }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const statItems = [
    {
      icon: Users,
      value: stats.totalBeneficiaries,
      label: 'Total Beneficiaries',
      suffix: '+'
    },
    {
      icon: Heart,
      value: stats.activeCases,
      label: 'Active Cases',
      suffix: ''
    },
    {
      icon: Target,
      value: stats.successRate,
      label: 'Success Rate',
      suffix: '%'
    }
  ];

  return (
    <div ref={ref} className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((item, index) => (
            <StatCard
              key={index}
              icon={item.icon}
              value={item.value}
              label={item.label}
              suffix={item.suffix}
              delay={index * 0.1}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramStats;