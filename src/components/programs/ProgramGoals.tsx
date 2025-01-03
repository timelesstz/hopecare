import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: string;
  achieved: string;
}

interface ProgramGoalsProps {
  goals?: Goal[];
  category: 'education' | 'health' | 'economic';
}

const defaultGoals: Goal[] = [
  {
    id: 1,
    title: 'Initial Goal',
    description: 'Working towards our first milestone',
    progress: 0,
    target: 'In Progress',
    achieved: 'Not Yet'
  }
];

const ProgramGoals: React.FC<ProgramGoalsProps> = ({ goals = defaultGoals, category }) => {
  const categoryColors = {
    education: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      progress: 'bg-blue-600',
      border: 'border-blue-200'
    },
    health: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      progress: 'bg-green-600',
      border: 'border-green-200'
    },
    economic: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      progress: 'bg-purple-600',
      border: 'border-purple-200'
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Target className={`h-12 w-12 ${categoryColors[category].text} mx-auto mb-4`} />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Goals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tracking our progress towards creating lasting impact in our communities
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${categoryColors[category].bg} rounded-lg p-6 border ${categoryColors[category].border}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{goal.title}</h3>
                  <p className="text-gray-600 mb-4">{goal.description}</p>
                </div>
                <CheckCircle2 className={`h-6 w-6 ${categoryColors[category].text}`} />
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className={categoryColors[category].text}>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${categoryColors[category].progress} rounded-full h-2`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="font-medium text-gray-900">{goal.target}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achieved</p>
                  <p className="font-medium text-gray-900">{goal.achieved}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramGoals;
