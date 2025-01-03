import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Book, Users, Award } from 'lucide-react';

const EducationHero = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80"
          alt="Education Program"
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
          <GraduationCap className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Empowering Through Education
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
            Creating pathways to success through quality education, mentorship, and
            comprehensive learning support for underserved communities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Book className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">15+</div>
            <p className="text-blue-100">Learning Centers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Users className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">2,500+</div>
            <p className="text-blue-100">Students Supported</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Award className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">95%</div>
            <p className="text-blue-100">Graduation Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <GraduationCap className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">850+</div>
            <p className="text-blue-100">Scholarships Awarded</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EducationHero;