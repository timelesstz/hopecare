import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';

interface TimelineEventProps {
  date: string;
  title: string;
  description: string;
  isEven: boolean;
  delay?: number;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  date,
  title,
  description,
  isEven,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex items-center ${
        isEven ? 'justify-start' : 'justify-end'
      }`}
    >
      <div
        className={`w-5/12 ${
          isEven ? 'text-right pr-8' : 'text-left pl-8'
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center text-rose-600 mb-2">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="font-medium">{date}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
        <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineEvent;