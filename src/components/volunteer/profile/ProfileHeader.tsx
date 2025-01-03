import React from 'react';
import { User, Award } from 'lucide-react';
import { Volunteer } from '../../../types/volunteer';

interface ProfileHeaderProps {
  volunteer: Volunteer;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ volunteer }) => {
  return (
    <div className="flex items-center mb-6">
      <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center">
        <User className="h-8 w-8 text-rose-600" />
      </div>
      <div className="ml-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {volunteer.firstName} {volunteer.lastName}
        </h2>
        <div className="flex items-center mt-1">
          <Award className="h-5 w-5 text-rose-600 mr-2" />
          <span className="text-gray-600">{volunteer.role.name}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;