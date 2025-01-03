import React from 'react';

interface ImpactMetric {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

interface ImpactMetricsProps {
  metrics: ImpactMetric[];
}

const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300"
        >
          {metric.icon && (
            <div className="flex justify-center mb-4 text-primary-600">
              {metric.icon}
            </div>
          )}
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {metric.value}
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-2">
            {metric.label}
          </div>
          {metric.description && (
            <p className="text-sm text-gray-600">{metric.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImpactMetrics;
