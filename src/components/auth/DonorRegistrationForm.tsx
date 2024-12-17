import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User, Lock, Phone, Calendar } from 'lucide-react';

const donorSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  birthDate: z.string(),
  address: z.string().min(5, 'Address is required'),
  preferredCommunication: z.enum(['email', 'phone', 'both']),
  interests: z.array(z.string()).min(1, 'Select at least one interest')
});

type DonorFormData = z.infer<typeof donorSchema>;

interface DonorRegistrationFormProps {
  onSubmit: (data: DonorFormData) => void;
  isLoading: boolean;
}

const DonorRegistrationForm: React.FC<DonorRegistrationFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema)
  });

  const interests = [
    'Education Programs',
    'Health Initiatives',
    'Economic Empowerment',
    'Environmental Projects',
    'Youth Development',
    'Community Building'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <div className="mt-1 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('firstName')}
              type="text"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <div className="mt-1 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('lastName')}
              type="text"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="mt-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('email')}
            type="email"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('password')}
            type="password"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <div className="mt-1 relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('phone')}
            type="tel"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Birth Date</label>
        <div className="mt-1 relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('birthDate')}
            type="date"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        {errors.birthDate && (
          <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          {...register('address')}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Communication</label>
        <select
          {...register('preferredCommunication')}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="both">Both</option>
        </select>
        {errors.preferredCommunication && (
          <p className="mt-1 text-sm text-red-600">{errors.preferredCommunication.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
        <div className="grid grid-cols-2 gap-4">
          {interests.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                value={interest}
                {...register('interests')}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">{interest}</span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <p className="mt-1 text-sm text-red-600">{errors.interests.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default DonorRegistrationForm;