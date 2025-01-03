import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Heart, Activity, Users, Award } from 'lucide-react';

const impactStats = [
  {
    icon: Users,
    value: 3500,
    label: "Lives Impacted",
    description: "Community members served through our healthcare programs"
  },
  {
    icon: Activity,
    value: 85,
    suffix: "%",
    label: "Health Improvement",
    description: "Average improvement in community health indicators"
  },
  {
    icon: Heart,
    value: 12000,
    label: "Health Screenings",
    description: "Preventive health screenings conducted annually"
  },
  {
    icon: Award,
    value: 95,
    suffix: "%",
    label: "Satisfaction Rate",
    description: "Patient satisfaction with our healthcare services"
  }
];

const HealthImpact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={ref} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Measuring our success through improved health outcomes and community well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg mb-4">
                <stat.icon className="h-6 w-6 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    separator=","
                    suffix={stat.suffix || ''}
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</h3>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthImpact;