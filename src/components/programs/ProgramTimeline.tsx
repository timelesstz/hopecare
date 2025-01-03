import React from 'react';
import TimelineEvent from './timeline/TimelineEvent';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface ProgramTimelineProps {
  events: TimelineEvent[];
}

const ProgramTimeline: React.FC<ProgramTimelineProps> = ({ events }) => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Program Timeline</h2>
          <p className="mt-4 text-lg text-gray-600">
            Key milestones and achievements in our journey
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200" />

          <div className="space-y-12">
            {events.map((event, index) => (
              <TimelineEvent
                key={index}
                {...event}
                isEven={index % 2 === 0}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramTimeline;