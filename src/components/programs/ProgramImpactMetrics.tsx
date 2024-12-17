import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

interface ImpactMetric {
  icon: React.ElementType;
  value: number;
  label: string;
  description: string;
}

interface ProgramImpactMetricsProps {
  metrics: ImpactMetric[];
}

const ProgramImpactMetrics: React.FC<ProgramImpactMetricsProps> = ({ metrics }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={ref} className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Program Impact</h2>
          <p className="mt-4 text-lg text-gray-600">
            Measuring our success through tangible outcomes and community transformation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-4">
                  <Icon className="h-6 w-6 text-rose-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {inView && (
                    <CountUp
                      end={metric.value}
                      duration={2.5}
                      separator=","
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.label}</h3>
                <p className="text-gray-600 text-sm">{metric.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgramImpactMetrics;