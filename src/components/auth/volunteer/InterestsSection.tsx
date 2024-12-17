import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { VolunteerFormData } from '../../../types/volunteer';
import { Heart } from 'lucide-react';

interface InterestsSectionProps {
  register: UseFormRegister<VolunteerFormData>;
  errors: FieldErrors<VolunteerFormData>;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({ register, errors }) => {
  const interests = [
    'Education Programs',
    'Health Initiatives',
    'Youth Programs',
    'Environmental Projects',
    'Senior Support',
    'Community Events'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Heart className="h-5 w-5 text-[#2B8ACB] mr-2" />
        <h3 className="text-lg font-medium text-[#1E6CA3]">Areas of Interest</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {interests.map((interest) => (
          <label key={interest} className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#2B8ACB] transition-colors duration-200">
            <input
              type="checkbox"
              value={interest}
              {...register('interests')}
              className="h-4 w-4 text-[#2B8ACB] focus:ring-[#2B8ACB] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">{interest}</span>
          </label>
        ))}
      </div>

      {errors.interests && (
        <p className="mt-1 text-sm text-[#D97B06]">{errors.interests.message}</p>
      )}

      <p className="text-sm text-[#2B8ACB]">
        Select the areas where you'd like to make a difference
      </p>
    </div>
  );
};

export default InterestsSection;