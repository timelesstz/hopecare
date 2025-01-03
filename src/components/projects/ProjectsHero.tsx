import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Target, MapPin } from 'lucide-react';

const stats = [
  {
    icon: Briefcase,
    value: "15+",
    label: "Active Projects"
  },
  {
    icon: Users,
    value: "10,000+",
    label: "Lives Impacted"
  },
  {
    icon: Target,
    value: "95%",
    label: "Success Rate"
  },
  {
    icon: MapPin,
    value: "9",
    label: "Districts Covered"
  }
];

const ProjectsHero = () => {
  return (
    <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80"
          alt="Projects Overview"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Our Impact Projects
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Making a lasting difference through sustainable community development initiatives
            and targeted interventions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
            >
              <stat.icon className="h-8 w-8 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <p className="text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsHero;