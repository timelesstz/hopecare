import React from 'react';
import { Globe } from 'lucide-react';
import { Volunteer } from '../../../types/volunteer';

interface SkillsLanguagesProps {
  volunteer: Volunteer;
}

const SkillsLanguages: React.FC<SkillsLanguagesProps> = ({ volunteer }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {volunteer.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
        <div className="flex items-center space-x-4">
          {volunteer.languages.map((language) => (
            <div key={language} className="flex items-center text-gray-600">
              <Globe className="h-4 w-4 mr-1" />
              <span>{language}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsLanguages;