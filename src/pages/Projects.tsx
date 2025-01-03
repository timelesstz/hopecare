import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Target, Calendar } from 'lucide-react';
import PageHero from '../components/PageHero';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectStats from '../components/projects/ProjectStats';

const Projects = () => {
  const stats = {
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    beneficiaries: 5000
  };

  const projects = [
    {
      id: 1,
      title: "Community Health Center",
      category: "Health",
      status: "Active",
      location: "Arusha",
      description: "Building a modern health facility to serve the local community",
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80",
      progress: 75,
      startDate: "2024-01",
      endDate: "2024-12",
      impact: "Will serve 2000+ patients annually",
      partners: ["Local Health Ministry", "Medical Aid International"]
    },
    {
      id: 2,
      title: "Rural School Development",
      category: "Education",
      status: "Active",
      location: "Mwanza",
      description: "Constructing classrooms and facilities for primary education",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80",
      progress: 60,
      startDate: "2024-02",
      endDate: "2024-11",
      impact: "Will educate 500+ children",
      partners: ["Education Ministry", "Build Africa"]
    },
    {
      id: 3,
      title: "Women's Vocational Center",
      category: "Economic Empowerment",
      status: "Active",
      location: "Dodoma",
      description: "Training facility for women entrepreneurs",
      image: "https://images.unsplash.com/photo-1573497491765-dccce02b29df?auto=format&fit=crop&q=80",
      progress: 40,
      startDate: "2024-03",
      endDate: "2025-03",
      impact: "Will train 300+ women annually",
      partners: ["Women's Empowerment Network", "Skills Development Fund"]
    }
  ];

  const impactMetrics = [
    {
      icon: Building2,
      value: 12,
      label: 'Total Projects',
      description: 'Across Tanzania'
    },
    {
      icon: Users,
      value: 5000,
      label: 'Beneficiaries',
      description: 'Lives impacted'
    },
    {
      icon: Target,
      value: 8,
      label: 'Active Projects',
      description: 'Currently running'
    },
    {
      icon: Calendar,
      value: 4,
      label: 'Completed',
      description: 'Successful projects'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHero
        title="Our Projects"
        description="Transforming communities through sustainable development initiatives"
        image="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProjectStats stats={stats} metrics={impactMetrics} />
        
        <div className="my-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Current Projects</h2>
          <ProjectFilter />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <a
              href="/volunteer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
            >
              Get Involved
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;