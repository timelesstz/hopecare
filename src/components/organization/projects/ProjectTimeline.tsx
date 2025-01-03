import React from 'react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Project } from '../../../data/organization/projects';

interface ProjectTimelineProps {
  projects: Project[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.period.start);
    const dateB = new Date(b.period.start);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-12">
        {sortedProjects.map((project, index) => (
          <div key={project.name} className="relative pl-12">
            <div className="absolute left-0 top-6 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-rose-600" />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {project.period.start} - {project.period.end}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{project.coverage.join(', ')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Target Audience</h4>
                  <ul className="space-y-1">
                    {project.targetAudience.map((audience, i) => (
                      <li key={i} className="text-sm text-gray-600">• {audience}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Interventions</h4>
                  <ul className="space-y-1">
                    {project.intervention.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{project.beneficiaries.toLocaleString()} beneficiaries</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">${project.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;