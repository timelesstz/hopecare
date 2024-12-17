```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donorSchema } from '../../../types/donor';
import { useDonorForm } from '../../../store/donorForm';
import { User, Mail, Lock, Phone, Calendar } from 'lucide-react';
import PasswordStrengthMeter from '../../auth/PasswordStrengthMeter';

const PersonalInfoStep = () => {
  const { formData, updateFormData, setStep } = useDonorForm();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(donorSchema.shape.personalInfo),
    defaultValues: formData.personalInfo
  });

  const password = watch('password', '');

  const onSubmit = (data: any) => {
    updateFormData({ personalInfo: data });
    setStep(1);
  };

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
              aria-invalid={errors.firstName ? 'true' : 'false'}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.firstName.message}</p>
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
              aria-invalid={errors.lastName ? 'true' : 'false'}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.lastName.message}</p>
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
            aria-invalid={errors.email ? 'true' : 'false'}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
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
            aria-invalid={errors.password ? 'true' : 'false'}
          />
        </div>
        <PasswordStrengthMeter password={password} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="mt-1 relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('phone')}
              type="tel"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              aria-invalid={errors.phone ? 'true' : 'false'}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.phone.message}</p>
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
              aria-invalid={errors.birthDate ? 'true' : 'false'}
            />
          </div>
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.birthDate.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 transition-colors"
        >
          Next Step
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
```