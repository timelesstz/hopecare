```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donorSchema } from '../../../types/donor';
import { useDonorForm } from '../../../store/donorForm';
import { useFormAnalytics } from '../../../hooks/useFormAnalytics';
import AccessibleLabel from './AccessibleLabel';
import AccessibleErrorMessage from './AccessibleErrorMessage';
import AccessibleCheckbox from './AccessibleCheckbox';

const interests = [
  'Education Programs',
  'Health Initiatives',
  'Youth Programs',
  'Environmental Projects',
  'Senior Support',
  'Community Events'
];

const PreferencesStep = () => {
  const { formData, updateFormData, setStep } = useDonorForm();
  const { trackError } = useFormAnalytics('donor-registration');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(donorSchema.shape.preferences),
    defaultValues: formData.preferences
  });

  const onSubmit = (data: any) => {
    updateFormData({ preferences: data });
    setStep(3);
  };

  const onBack = () => {
    setStep(1);
  };

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(fieldName => {
        trackError(fieldName);
      });
    }
  }, [errors, trackError]);

  const watchInterests = watch('interests', []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <AccessibleLabel
          id="interests"
          label="Areas of Interest"
          required
          error={errors.interests?.message}
          description="Select the causes you're most passionate about supporting"
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {interests.map((interest) => (
            <AccessibleCheckbox
              key={interest}
              id={`interest-${interest}`}
              label={interest}
              name="interests"
              checked={watchInterests.includes(interest)}
              onChange={() => {}}
              {...register('interests')}
            />
          ))}
        </div>
        {errors.interests && (
          <AccessibleErrorMessage
            id="interests"
            message={errors.interests.message as string}
          />
        )}
      </div>

      <div>
        <AccessibleLabel
          id="communication"
          label="Preferred Communication Method"
          required
          error={errors.communication?.message}
          description="How would you like us to keep in touch?"
        />
        <select
          {...register('communication')}
          id="communication"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          aria-describedby="communication-description"
        >
          <option value="">Select a preference</option>
          <option value="email">Email Only</option>
          <option value="phone">Phone Only</option>
          <option value="both">Both Email and Phone</option>
        </select>
        {errors.communication && (
          <AccessibleErrorMessage
            id="communication"
            message={errors.communication.message as string}
          />
        )}
      </div>

      <div className="space-y-4">
        <AccessibleCheckbox
          id="newsletter"
          label="Subscribe to Newsletter"
          name="newsletter"
          checked={watch('newsletter')}
          onChange={() => {}}
          description="Receive monthly updates about our programs and impact"
          {...register('newsletter')}
        />

        <AccessibleCheckbox
          id="taxReceipts"
          label="Receive Tax Receipts"
          name="taxReceipts"
          checked={watch('taxReceipts')}
          onChange={() => {}}
          description="Automatically receive tax receipts for your donations"
          {...register('taxReceipts')}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 font-medium"
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

export default PreferencesStep;
```