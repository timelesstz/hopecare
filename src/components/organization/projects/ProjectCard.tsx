import React from 'react';
import { Calendar, Users, DollarSign, MapPin } from 'lucide-react';
import { Project } from '../../../data/organization/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{project.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Audience</h4>
            <ul className="space-y-1">
              {project.targetAudience.map((audience, index) => (
                <li key={index} className="text-gray-600">• {audience}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Interventions</h4>
            <ul className="space-y-1">
              {project.intervention.map((item, index) => (
                <li key={index} className="text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">{project.beneficiaries.toLocaleString()} beneficiaries</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">${project.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">{project.period.start} - {project.period.end}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;