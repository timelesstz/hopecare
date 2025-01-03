import React from 'react';
import { CheckCircle, Users, Award } from 'lucide-react';
import { programAchievements } from '../../../data/organization/achievements';

const ProgramOutcomes: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Outcomes</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programAchievements.map((program) => (
          <div key={program.title} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {program.title === 'Economic Empowerment' ? (
                <Award className="h-8 w-8 text-rose-600" />
              ) : program.title === 'Education' ? (
                <Users className="h-8 w-8 text-rose-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-rose-600" />
              )}
              <h4 className="ml-3 text-lg font-medium text-gray-900">{program.title}</h4>
            </div>

            <p className="text-gray-600 mb-4">{program.description}</p>

            <ul className="space-y-2">
              {program.metrics.map((metric, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="mr-2">•</span>
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramOutcomes;