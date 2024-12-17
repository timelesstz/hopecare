import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Heart, BookOpen } from 'lucide-react';

const initiatives = [
  {
    title: "Community Health Education",
    description: "Empowering communities through health education and awareness programs.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80",
    stats: {
      participants: "1,200+",
      sessions: "48",
      communities: "15"
    }
  },
  {
    title: "Mobile Health Clinics",
    description: "Bringing healthcare services directly to remote and underserved areas.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80",
    stats: {
      patients: "2,500+",
      locations: "25",
      services: "12"
    }
  },
  {
    title: "Preventive Care Programs",
    description: "Focus on disease prevention and early detection through regular screenings.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80",
    stats: {
      screenings: "3,000+",
      conditions: "15",
      prevention: "85%"
    }
  }
];

const HealthInitiatives = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Health Initiatives</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Innovative programs designed to improve community health outcomes and promote
            preventive care practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={initiative.image}
                  alt={initiative.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-xl font-bold text-white px-4 text-center">
                    {initiative.title}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">{initiative.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(initiative.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-rose-600">{value}</div>
                      <div className="text-sm text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition-colors"
          >
            <Heart className="h-5 w-5 mr-2" />
            Get Involved
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default HealthInitiatives;