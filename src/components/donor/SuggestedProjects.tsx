import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Share2 } from 'lucide-react';
import ShareProject from './sharing/ShareProject';

interface Project {
  id: number;
  title: string;
  description: string;
  target: number;
  raised: number;
  image: string;
}

interface SuggestedProjectsProps {
  projects: Project[];
}

const SuggestedProjects: React.FC<SuggestedProjectsProps> = ({ projects }) => {
  const [sharingProject, setSharingProject] = useState<Project | null>(null);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>${project.raised.toLocaleString()} raised</span>
                  <span>of ${project.target.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-rose-600 rounded-full h-2" 
                    style={{ width: `${(project.raised / project.target) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  to={`/donate?project=${project.id}`}
                  className="text-rose-600 hover:text-rose-700 font-medium flex items-center"
                >
                  Support This Project
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                <button
                  onClick={() => setSharingProject(project)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sharingProject && (
        <ShareProject
          project={sharingProject}
          onClose={() => setSharingProject(null)}
        />
      )}
    </div>
  );
};

export default SuggestedProjects;