import { useEffect } from 'react';
import { useFormAnalytics } from '../../../hooks/useFormAnalytics';

interface FormAnalyticsProps {
  formId: string;
  currentStep: number;
  errors: Record<string, any>;
}

const FormAnalytics: React.FC<FormAnalyticsProps> = ({
  formId,
  currentStep,
  errors
}) => {
  const { trackStep, trackError } = useFormAnalytics(formId);

  useEffect(() => {
    trackStep(currentStep);
  }, [currentStep, trackStep]);

  useEffect(() => {
    Object.keys(errors).forEach(fieldName => {
      if (errors[fieldName]) {
        trackError(fieldName);
      }
    });
  }, [errors, trackError]);

  return null; // This is a tracking-only component
};

export default FormAnalytics;