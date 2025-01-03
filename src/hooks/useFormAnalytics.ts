import { useEffect } from 'react';
import { analyticsTracker } from '../utils/analytics';

export const useFormAnalytics = (formId: string) => {
  useEffect(() => {
    analyticsTracker.startFormTracking(formId);
    return () => {
      analyticsTracker.completeFormTracking(formId);
    };
  }, [formId]);

  return {
    trackStep: (step: number) => analyticsTracker.trackStepCompletion(formId, step),
    trackError: (fieldName: string) => analyticsTracker.trackError(formId, fieldName)
  };
};