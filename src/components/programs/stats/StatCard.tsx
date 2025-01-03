import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  inView: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  suffix = '',
  delay = 0,
  inView
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-lg shadow-lg p-6 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-4">
        <Icon className="h-6 w-6 text-rose-600" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {inView && (
          <CountUp
            end={value}
            duration={2.5}
            separator=","
            suffix={suffix}
          />
        )}
      </div>
      <p className="text-gray-600">{label}</p>
    </motion.div>
  );
};

export default StatCard;