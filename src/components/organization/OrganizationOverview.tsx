import React from 'react';
import { Heart, Users, MapPin, Target } from 'lucide-react';

const OrganizationOverview = () => {
  return (
    <div className="bg-white">
      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Heart className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            To empower vulnerable and poor communities through implementing activities in Health (HIV/AIDS & WASH), 
            Economic Empowerment, Education, and Food Security.
          </p>
        </div>

        <div className="text-center mb-12">
          <Target className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Improved sustainable livelihoods among the vulnerable and poor communities in Mainland Tanzania.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <Users className="h-12 w-12 text-rose-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-gray-900 mb-2">250+</p>
            <p className="text-gray-600">Active Groups</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-rose-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-gray-900 mb-2">7,500+</p>
            <p className="text-gray-600">Members</p>
          </div>
          <div className="text-center">
            <MapPin className="h-12 w-12 text-rose-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-gray-900 mb-2">9</p>
            <p className="text-gray-600">Districts Covered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOverview;