```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donorSchema } from '../../../types/donor';
import { useDonorForm } from '../../../store/donorForm';
import { MapPin } from 'lucide-react';
import AccessibleLabel from './AccessibleLabel';
import AccessibleErrorMessage from './AccessibleErrorMessage';

const AddressStep = () => {
  const { formData, updateFormData, setStep } = useDonorForm();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(donorSchema.shape.address),
    defaultValues: formData.address
  });

  const onSubmit = (data: any) => {
    updateFormData({ address: data });
    setStep(2);
  };

  const onBack = () => {
    setStep(0);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <AccessibleLabel
          id="street"
          label="Street Address"
          required
          error={errors.street?.message}
        />
        <div className="mt-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('street')}
            id="street"
            type="text"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            aria-invalid={errors.street ? 'true' : 'false'}
          />
        </div>
        {errors.street && (
          <AccessibleErrorMessage
            id="street"
            message={errors.street.message as string}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <AccessibleLabel
            id="city"
            label="City"
            required
            error={errors.city?.message}
          />
          <input
            {...register('city')}
            id="city"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            aria-invalid={errors.city ? 'true' : 'false'}
          />
          {errors.city && (
            <AccessibleErrorMessage
              id="city"
              message={errors.city.message as string}
            />
          )}
        </div>

        <div>
          <AccessibleLabel
            id="state"
            label="State/Province"
            required
            error={errors.state?.message}
          />
          <input
            {...register('state')}
            id="state"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            aria-invalid={errors.state ? 'true' : 'false'}
          />
          {errors.state && (
            <AccessibleErrorMessage
              id="state"
              message={errors.state.message as string}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <AccessibleLabel
            id="postalCode"
            label="Postal Code"
            required
            error={errors.postalCode?.message}
          />
          <input
            {...register('postalCode')}
            id="postalCode"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            aria-invalid={errors.postalCode ? 'true' : 'false'}
          />
          {errors.postalCode && (
            <AccessibleErrorMessage
              id="postalCode"
              message={errors.postalCode.message as string}
            />
          )}
        </div>

        <div>
          <AccessibleLabel
            id="country"
            label="Country"
            required
            error={errors.country?.message}
          />
          <select
            {...register('country')}
            id="country"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            aria-invalid={errors.country ? 'true' : 'false'}
          >
            <option value="">Select a country</option>
            <option value="TZ">Tanzania</option>
            <option value="KE">Kenya</option>
            <option value="UG">Uganda</option>
            <option value="RW">Rwanda</option>
          </select>
          {errors.country && (
            <AccessibleErrorMessage
              id="country"
              message={errors.country.message as string}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          Back
        </button>
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

export default AddressStep;
```