import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SuccessCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  impact: string;
  delay?: number;
}

const SuccessCard: React.FC<SuccessCardProps> = ({
  icon: Icon,
  title,
  description,
  impact,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-4">
        <Icon className="h-6 w-6 text-rose-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <p className="text-rose-600 font-medium">{impact}</p>
    </motion.div>
  );
};

export default SuccessCard;