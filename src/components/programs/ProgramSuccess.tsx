import React from 'react';
import { useInView } from 'react-intersection-observer';
import SuccessCard from './success/SuccessCard';

interface SuccessStory {
  title: string;
  description: string;
  impact: string;
  icon: React.ElementType;
}

interface ProgramSuccessProps {
  stories: SuccessStory[];
}

const ProgramSuccess: React.FC<ProgramSuccessProps> = ({ stories }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={ref} className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="mt-4 text-lg text-gray-600">
            Real impact in our communities through sustainable development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <SuccessCard
              key={index}
              icon={story.icon}
              title={story.title}
              description={story.description}
              impact={story.impact}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramSuccess;