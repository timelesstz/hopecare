import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users, MapPin } from 'lucide-react';
import { CMSProject } from '@/types/cms';

interface ProjectCardProps {
  project: CMSProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const progress = (project.raisedAmount / project.targetAmount) * 100;
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/projects/${project.slug}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full">
              {project.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-rose-600 transition-colors">
            {project.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{project.donorCount} donors</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">
              ${project.raisedAmount.toLocaleString()}
            </span>
            <span className="text-gray-500">
              of ${project.targetAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% funded
            </span>
            <button 
              className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Add donation modal trigger here
              }}
            >
              <Heart className="w-4 h-4" />
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
