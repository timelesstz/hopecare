import React from 'react';
import { Calendar, Users, DollarSign, MapPin } from 'lucide-react';
import { pastProjects } from '../../data/organization/projects';
import { calculateProjectMetrics } from '../../utils/organizationUtils';

const ProjectsOverview = () => {
  const metrics = calculateProjectMetrics(pastProjects);

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Impact</h2>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{metrics.totalBeneficiaries.toLocaleString()}</p>
            <p className="text-gray-600">Total Beneficiaries</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <DollarSign className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">${metrics.totalFunding.toLocaleString()}</p>
            <p className="text-gray-600">Total Funding</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Calendar className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{metrics.activeProjects}</p>
            <p className="text-gray-600">Active Projects</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <MapPin className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{metrics.completedProjects}</p>
            <p className="text-gray-600">Completed Projects</p>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-8">
          {pastProjects.map((project) => (
            <div key={project.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{project.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Audience</h4>
                    <ul className="space-y-1">
                      {project.targetAudience.map((audience, index) => (
                        <li key={index} className="text-gray-600">• {audience}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Interventions</h4>
                    <ul className="space-y-1">
                      {project.intervention.map((item, index) => (
                        <li key={index} className="text-gray-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">{project.beneficiaries.toLocaleString()} beneficiaries</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">${project.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">{project.period.start} - {project.period.end}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsOverview;