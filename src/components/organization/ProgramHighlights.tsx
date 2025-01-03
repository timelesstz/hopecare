import React from 'react';
import { Briefcase, GraduationCap, Heart } from 'lucide-react';
import { programAchievements } from '../../data/organization/achievements';

const ProgramHighlights = () => {
  const programIcons = {
    "Economic Empowerment": Briefcase,
    "Education": GraduationCap,
    "Health": Heart
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Programs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programAchievements.map((program) => {
            const Icon = programIcons[program.title as keyof typeof programIcons] || Heart;
            
            return (
              <div key={program.title} className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <Icon className="h-12 w-12 text-rose-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">{program.description}</p>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Achievements:</h4>
                    <ul className="space-y-2">
                      {program.metrics.map((metric, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <span className="mr-2">•</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgramHighlights;