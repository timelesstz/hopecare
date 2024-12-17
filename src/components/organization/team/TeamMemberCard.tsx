import React from 'react';
import { User, Mail, Phone, Award } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  position: string;
  biography: string;
  contact: string;
  qualifications: string[];
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({
  name,
  position,
  biography,
  contact,
  qualifications
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-rose-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-rose-600">{position}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{biography}</p>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {contact}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Qualifications</span>
            </div>
            <ul className="pl-7 space-y-1">
              {qualifications.map((qual, index) => (
                <li key={index} className="text-sm text-gray-600">• {qual}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;