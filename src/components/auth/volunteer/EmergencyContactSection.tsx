import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { VolunteerFormData } from '../../../types/volunteer';
import { Phone, User, Heart } from 'lucide-react';

interface EmergencyContactSectionProps {
  register: UseFormRegister<VolunteerFormData>;
  errors: FieldErrors<VolunteerFormData>;
}

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  register,
  errors
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Heart className="h-5 w-5 text-[#2B8ACB] mr-2" />
        <h3 className="text-lg font-medium text-[#1E6CA3]">Emergency Contact</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-1">
            <User className="h-4 w-4 text-[#2B8ACB] mr-2" />
            <label className="block text-sm font-medium text-[#1E6CA3]">Name</label>
          </div>
          <input
            {...register('emergencyContact.name')}
            type="text"
            placeholder="John Doe"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2B8ACB] focus:border-[#2B8ACB]"
          />
          {errors.emergencyContact?.name && (
            <p className="mt-1 text-sm text-[#D97B06]">{errors.emergencyContact.name.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Phone className="h-4 w-4 text-[#2B8ACB] mr-2" />
            <label className="block text-sm font-medium text-[#1E6CA3]">Phone</label>
          </div>
          <input
            {...register('emergencyContact.phone')}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2B8ACB] focus:border-[#2B8ACB]"
          />
          {errors.emergencyContact?.phone && (
            <p className="mt-1 text-sm text-[#D97B06]">{errors.emergencyContact.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center mb-1">
            <User className="h-4 w-4 text-[#2B8ACB] mr-2" />
            <label className="block text-sm font-medium text-[#1E6CA3]">Relationship</label>
          </div>
          <input
            {...register('emergencyContact.relationship')}
            type="text"
            placeholder="Parent, Spouse, Sibling, etc."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2B8ACB] focus:border-[#2B8ACB]"
          />
          {errors.emergencyContact?.relationship && (
            <p className="mt-1 text-sm text-[#D97B06]">{errors.emergencyContact.relationship.message}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-[#2B8ACB]">
        This information will only be used in case of emergency
      </p>
    </div>
  );
};

export default EmergencyContactSection;