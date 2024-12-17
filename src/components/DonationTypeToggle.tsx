import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Sparkles } from 'lucide-react';

interface DonationTypeToggleProps {
  selectedType: 'one-time' | 'monthly';
  onTypeChange: (type: 'one-time' | 'monthly') => void;
}

export const DonationTypeToggle = ({
  selectedType,
  onTypeChange,
}: DonationTypeToggleProps) => {
  const options = [
    {
      id: 'one-time',
      label: 'One-time',
      description: 'Make a single donation',
      icon: Heart,
      color: 'rose'
    },
    {
      id: 'monthly',
      label: 'Monthly',
      description: 'Support us every month',
      icon: Calendar,
      benefits: ['Greater impact', 'Sustainable support'],
      color: 'purple'
    }
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onTypeChange(option.id as 'one-time' | 'monthly')}
            className={`
              flex-1 p-4 rounded-xl
              ${selectedType === option.id 
                ? `bg-${option.color}-50 ring-2 ring-${option.color}-500` 
                : 'bg-white hover:bg-gray-50'}
              transition-all duration-200
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg
                ${selectedType === option.id 
                  ? `bg-${option.color}-100 text-${option.color}-600` 
                  : 'bg-gray-100 text-gray-500'}
              `}>
                <option.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className={`
                    font-medium
                    ${selectedType === option.id 
                      ? `text-${option.color}-900` 
                      : 'text-gray-900'}
                  `}>
                    {option.label}
                  </h3>
                  {option.id === 'monthly' && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${selectedType === option.id 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-gray-100 text-gray-600'}
                    `}>
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
                {option.benefits && selectedType === option.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {option.benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 text-sm text-purple-600"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
