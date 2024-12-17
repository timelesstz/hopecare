import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Users, Stethoscope } from 'lucide-react';

const HealthHero = () => {
  return (
    <div className="relative bg-gradient-to-r from-rose-600 to-rose-800 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80"
          alt="Health Program"
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
          <Heart className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Healthcare for All
          </h1>
          <p className="text-xl text-rose-100 max-w-3xl mx-auto mb-12">
            Providing accessible, quality healthcare services and promoting community
            wellness through comprehensive health programs and education.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Users className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">3,500+</div>
            <p className="text-rose-100">Patients Served</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Activity className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">12</div>
            <p className="text-rose-100">Health Centers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Heart className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">98%</div>
            <p className="text-rose-100">Success Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Stethoscope className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">45</div>
            <p className="text-rose-100">Healthcare Workers</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthHero;