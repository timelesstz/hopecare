import { useCallback } from 'react';
import { analytics } from '../lib/analytics';
import { AnalyticsEvent } from '../types/analytics';

export const useAnalytics = () => {
  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'timestamp' | 'session_id'>) => {
    try {
      await analytics.track(event);
    } catch (error) {
      // Error is already handled in analytics.ts
      // We can add additional handling here if needed
      if (process.env.NODE_ENV === 'development') {
        console.debug('Analytics event handled:', event);
      }
    }
  }, []);

  return {
    trackEvent,
  };
};
