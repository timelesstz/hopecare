import React from 'react';
import { CMSProject } from '@/types/cms';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: CMSProject[];
  loading?: boolean;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl animate-pulse h-[400px]"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No projects found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or check back later for new projects.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
