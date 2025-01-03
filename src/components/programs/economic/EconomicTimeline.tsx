import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

const timelineEvents = [
  {
    icon: DollarSign,
    title: "Microfinance Program Launch",
    subtitle: "January 2024",
    description: "Initiated microfinance services for small businesses with 500 initial participants",
    iconBg: "#059669",
    iconColor: "#ffffff"
  },
  {
    icon: Users,
    title: "Business Training Program",
    subtitle: "March 2024",
    description: "Launched comprehensive business skills training for 200 entrepreneurs",
    iconBg: "#0284C7",
    iconColor: "#ffffff"
  },
  {
    icon: TrendingUp,
    title: "Market Access Initiative",
    subtitle: "May 2024",
    description: "Established partnerships with 50 companies to create market opportunities",
    iconBg: "#DC2626",
    iconColor: "#ffffff"
  },
  {
    icon: Award,
    title: "Entrepreneurship Awards",
    subtitle: "July 2024",
    description: "Recognized and supported 100 successful business ventures",
    iconBg: "#D97706",
    iconColor: "#ffffff"
  }
];

const EconomicTimeline = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Timeline</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Key milestones in our journey to create sustainable economic opportunities
            and empower local entrepreneurs.
          </p>
        </div>

        <VerticalTimeline>
          {timelineEvents.map((event, index) => (
            <VerticalTimelineElement
              key={index}
              className="vertical-timeline-element"
              contentStyle={{ 
                background: 'rgb(255, 255, 255)',
                boxShadow: '0 3px 0 #ddd',
                borderRadius: '0.5rem'
              }}
              contentArrowStyle={{ borderRight: '7px solid rgb(255, 255, 255)' }}
              date={event.subtitle}
              iconStyle={{ background: event.iconBg, color: event.iconColor }}
              icon={<event.icon className="w-5 h-5" />}
            >
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              <p className="text-gray-600 mt-2">{event.description}</p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

export default EconomicTimeline;