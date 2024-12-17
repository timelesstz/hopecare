import React from 'react';
import { organizationalStructure } from '../../../data/organization/structure';

const OrganizationChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Organizational Structure</h3>

      <div className="space-y-8">
        {/* Board of Directors */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Board of Directors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizationalStructure.board.map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{member.position}</p>
                <p className="text-gray-600">{member.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Leadership */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Executive Leadership</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-w-md">
            <p className="font-medium text-gray-900">Executive Director</p>
            <p className="text-gray-600">{organizationalStructure.executiveDirector}</p>
          </div>
        </div>

        {/* Program Departments */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Program Departments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizationalStructure.departments.programs.map((dept) => (
              <div key={dept.name} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{dept.name}</p>
                <p className="text-sm text-gray-600 mb-2">Head: {dept.head}</p>
                <div className="space-y-1">
                  {dept.roles.map((role, index) => (
                    <p key={index} className="text-sm text-gray-600">• {role}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Departments */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Support Departments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizationalStructure.departments.support.map((dept) => (
              <div key={dept.name} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{dept.name}</p>
                <p className="text-sm text-gray-600 mb-2">Head: {dept.head}</p>
                <div className="space-y-1">
                  {dept.roles.map((role, index) => (
                    <p key={index} className="text-sm text-gray-600">• {role}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationChart;