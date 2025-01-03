import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Book, GraduationCap, Users, Award } from 'lucide-react';

const timelineEvents = [
  {
    icon: Book,
    title: "Early Learning Centers",
    subtitle: "January 2024",
    description: "Launched 5 new early childhood education centers in rural communities",
    iconBg: "#60A5FA",
    iconColor: "#ffffff"
  },
  {
    icon: Users,
    title: "Teacher Training Program",
    subtitle: "March 2024",
    description: "Comprehensive training program for 50 local educators implemented",
    iconBg: "#34D399",
    iconColor: "#ffffff"
  },
  {
    icon: GraduationCap,
    title: "Scholarship Program",
    subtitle: "May 2024",
    description: "Awarded 200 scholarships to promising students from underprivileged backgrounds",
    iconBg: "#F87171",
    iconColor: "#ffffff"
  },
  {
    icon: Award,
    title: "Digital Library Launch",
    subtitle: "July 2024",
    description: "Introduced digital learning resources and tablet-based education programs",
    iconBg: "#FBBF24",
    iconColor: "#ffffff"
  }
];

const EducationTimeline = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Key milestones in our mission to transform education and create lasting impact
            in our communities.
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

export default EducationTimeline;