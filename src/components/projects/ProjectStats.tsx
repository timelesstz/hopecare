import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface Metric {
  icon: React.ElementType;
  value: number;
  label: string;
  description: string;
}

interface ProjectStatsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    beneficiaries: number;
  };
  metrics: Metric[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ stats, metrics }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={index}
            variants={item}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <Icon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp end={metric.value} duration={2} />
                </div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ProjectStats;
