import React from 'react';
import { Calendar, Check, Clock } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ events }) => {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />;
      case 'upcoming':
        return <Calendar className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'upcoming':
        return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Project Timeline
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Track our progress and upcoming milestones
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"
          aria-hidden="true"
        />

        <div className="relative z-10">
          {events.map((event, index) => (
            <div
              key={index}
              className={`relative mb-8 flex items-center ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}
            >
              {/* Content */}
              <div
                className={`w-5/12 ${
                  index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'
                }`}
              >
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {event.date}
                    </span>
                    {getStatusIcon(event.status)}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{event.description}</p>
                </div>
              </div>

              {/* Circle marker */}
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${getStatusColor(
                  event.status
                )}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
