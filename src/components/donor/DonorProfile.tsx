import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface DonorProfileProps {
  donor: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    joinDate: string;
  };
}

const DonorProfile: React.FC<DonorProfileProps> = ({ donor }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-rose-600" />
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {donor.firstName} {donor.lastName}
          </h2>
          <p className="text-gray-600">Member since {donor.joinDate}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-gray-600">
          <Mail className="h-5 w-5 mr-3" />
          <span>{donor.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-5 w-5 mr-3" />
          <span>{donor.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="h-5 w-5 mr-3" />
          <span>{donor.address}</span>
        </div>
      </div>

      <div className="mt-6">
        <button className="text-rose-600 hover:text-rose-700 font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default DonorProfile;