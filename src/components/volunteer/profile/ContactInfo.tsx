import React from 'react';
import { Mail, Phone, Calendar } from 'lucide-react';
import { Volunteer } from '../../../types/volunteer';

interface ContactInfoProps {
  volunteer: Volunteer;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ volunteer }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center text-gray-600">
        <Mail className="h-5 w-5 mr-3" />
        <span>{volunteer.email}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <Phone className="h-5 w-5 mr-3" />
        <span>{volunteer.phone}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <Calendar className="h-5 w-5 mr-3" />
        <span>Member since {volunteer.joinDate}</span>
      </div>
    </div>
  );
};

export default ContactInfo;