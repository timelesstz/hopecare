import React from 'react';
import { Users, Heart, GraduationCap, Briefcase } from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const stats = [
  {
    label: 'Years of Service',
    value: 15,
    suffix: '+',
    description: 'Years of Service'
  },
  {
    label: 'Active Members',
    value: 7500,
    suffix: '+',
    description: 'Active Members'
  },
  {
    label: 'Districts Served',
    value: 9,
    suffix: '',
    description: 'Districts Served'
  },
  {
    label: 'Community Groups',
    value: 250,
    suffix: '+',
    description: 'Community Groups'
  }
];

const ImpactStats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Through the dedication of our volunteers and supporters, we're making 
            measurable progress in creating sustainable change.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ label, value, suffix, description }, index) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {inView && (
                  <CountUp
                    end={value}
                    duration={2.5}
                    separator=","
                    suffix={suffix}
                  />
                )}
              </div>
              <div className="text-gray-600">{description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;