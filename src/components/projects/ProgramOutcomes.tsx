import React from 'react';
import { Check } from 'lucide-react';

interface Outcome {
  title: string;
  description: string;
  metrics?: {
    label: string;
    value: string | number;
  }[];
}

interface ProgramOutcomesProps {
  outcomes: Outcome[];
}

const ProgramOutcomes: React.FC<ProgramOutcomesProps> = ({ outcomes }) => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Program Outcomes
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Measurable impact and sustainable results from our initiatives
          </p>
        </div>

        <div className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {outcomes.map((outcome, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <Check className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {outcome.title}
                  </h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base text-gray-500">{outcome.description}</p>
              </div>
              {outcome.metrics && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {outcome.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        {metric.value}
                      </p>
                      <p className="text-sm text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramOutcomes;
