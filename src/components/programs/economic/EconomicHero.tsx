import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';

const EconomicHero = () => {
  return (
    <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"
          alt="Economic Empowerment"
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
          <TrendingUp className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Economic Empowerment
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-12">
            Creating sustainable livelihoods through entrepreneurship, skills development,
            and market access opportunities.
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
            <div className="text-3xl font-bold text-white mb-2">4,500+</div>
            <p className="text-emerald-100">Entrepreneurs Supported</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <DollarSign className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">250%</div>
            <p className="text-emerald-100">Average Income Increase</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <Briefcase className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">850+</div>
            <p className="text-emerald-100">Businesses Started</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center"
          >
            <TrendingUp className="h-8 w-8 text-white mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">92%</div>
            <p className="text-emerald-100">Success Rate</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EconomicHero;