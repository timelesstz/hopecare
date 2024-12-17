import React from 'react';
import { motion } from 'framer-motion';
import ObjectiveList from './overview/ObjectiveList';

interface ProgramOverviewProps {
  title: string;
  description: string;
  objectives: string[];
  approach: string[];
}

const ProgramOverview: React.FC<ProgramOverviewProps> = ({
  title,
  description,
  objectives,
  approach
}) => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-rose max-w-none"
        >
          <h2>{title}</h2>
          <p className="lead">{description}</p>

          <ObjectiveList title="Program Objectives" items={objectives} />
          <ObjectiveList title="Our Approach" items={approach} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgramOverview;