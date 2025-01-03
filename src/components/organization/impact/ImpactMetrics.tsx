import React from 'react';
import { Users, Target, MapPin, DollarSign } from 'lucide-react';
import { calculateProjectMetrics } from '../../../utils/organizationUtils';
import { pastProjects } from '../../../data/organization/projects';

const ImpactMetrics: React.FC = () => {
  const metrics = calculateProjectMetrics(pastProjects);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Our Impact</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {metrics.totalBeneficiaries.toLocaleString()}
          </p>
          <p className="text-gray-600">Total Beneficiaries</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <DollarSign className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            ${metrics.totalFunding.toLocaleString()}
          </p>
          <p className="text-gray-600">Total Funding</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Target className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {metrics.activeProjects}
          </p>
          <p className="text-gray-600">Active Projects</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <MapPin className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {metrics.completedProjects}
          </p>
          <p className="text-gray-600">Completed Projects</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactMetrics;