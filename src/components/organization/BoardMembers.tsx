import React from 'react';
import { User, Phone, Award } from 'lucide-react';
import { boardMembers } from '../../data/organization/board';

const BoardMembers = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Board of Directors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boardMembers.map((member) => (
            <div key={member.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                    <p className="text-rose-600">{member.position}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{member.biography}</p>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    {member.contact}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Qualifications</span>
                    </div>
                    <ul className="pl-7 space-y-1">
                      {member.qualifications.map((qual, index) => (
                        <li key={index} className="text-sm text-gray-600">• {qual}</li>
                      ))}
                    </ul>
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

export default BoardMembers;