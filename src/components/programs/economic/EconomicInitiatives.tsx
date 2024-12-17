import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Briefcase, TrendingUp, Users } from 'lucide-react';

const initiatives = [
  {
    icon: DollarSign,
    title: "Microfinance Program",
    description: "Providing accessible financial services to small businesses and entrepreneurs.",
    features: [
      "Low-interest loans",
      "Financial literacy training",
      "Business mentorship",
      "Savings programs"
    ]
  },
  {
    icon: Briefcase,
    title: "Business Development",
    description: "Supporting entrepreneurs with comprehensive business development services.",
    features: [
      "Business plan development",
      "Market research support",
      "Marketing strategies",
      "Operations management"
    ]
  },
  {
    icon: TrendingUp,
    title: "Market Access",
    description: "Creating market linkages and expanding business opportunities.",
    features: [
      "Market analysis",
      "Supply chain optimization",
      "Distribution networks",
      "Trade partnerships"
    ]
  },
  {
    icon: Users,
    title: "Skills Training",
    description: "Building capacity through vocational and business skills training.",
    features: [
      "Technical skills training",
      "Business management",
      "Digital literacy",
      "Professional development"
    ]
  }
];

const EconomicInitiatives = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Economic Initiatives</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive programs designed to create sustainable economic opportunities
            and foster entrepreneurial success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="bg-emerald-100 rounded-lg p-3">
                  <initiative.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 ml-4">{initiative.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{initiative.description}</p>
              <ul className="space-y-2">
                {initiative.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EconomicInitiatives;