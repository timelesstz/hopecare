import React from 'react';
import { motion } from 'framer-motion';

interface Partner {
  name: string;
  logo: string;
  description: string;
}

interface PartnersProps {
  partners: Partner[];
}

const Partners: React.FC<PartnersProps> = ({ partners }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {partners.map((partner, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-w-full max-h-full p-2"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
            <p className="text-gray-600">{partner.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Partners;
