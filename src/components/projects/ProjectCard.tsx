import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: {
    title: string;
    description: string;
    image: string;
    status: string;
    beneficiaries: number;
    budget: number;
    startDate: string;
    endDate: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${project.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'} text-white
          `}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <Users className="h-5 w-5 text-rose-500 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Beneficiaries</p>
            <p className="font-semibold">{project.beneficiaries.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <DollarSign className="h-5 w-5 text-rose-500 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-semibold">${project.budget.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <Calendar className="h-5 w-5 text-rose-500 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{new Date(project.endDate).getFullYear()}</p>
          </div>
        </div>

        {/* View Details Button */}
        <div className="flex items-center justify-end text-rose-600 group-hover:text-rose-700">
          <span className="text-sm font-medium">View Details</span>
          <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;