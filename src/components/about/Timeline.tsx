import React from 'react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-rose-200" />

      <div className="space-y-12">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Content */}
            <div className="w-5/12">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-rose-600 font-bold">{event.year}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{event.title}</h3>
                <p className="text-gray-600 mt-2">{event.description}</p>
              </div>
            </div>

            {/* Circle */}
            <div className="w-2/12 flex justify-center">
              <div className="w-4 h-4 bg-rose-500 rounded-full relative">
                <div className="absolute w-8 h-8 bg-rose-200 rounded-full -left-2 -top-2 animate-ping opacity-75" />
              </div>
            </div>

            {/* Empty space for alignment */}
            <div className="w-5/12" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
