// Import analytics from config which has the compatibility layer
import { analytics } from './config';
import { analytics as supabaseAnalytics } from '../lib/analytics-supabase';

// Create a dummy analytics instance for Firebase API compatibility
const analyticsInstance = analytics.getAnalytics();

// Analytics service for tracking events
export const analyticsService = {
  // Track page views
  trackPageView: (pageName: string, pageParams?: Record<string, any>) => {
    // Track through Firebase compatibility layer
    analytics.logEvent(analyticsInstance, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...pageParams
    });
    
    // Also track directly with Supabase analytics
    supabaseAnalytics.trackPageView({
      title: pageName,
      path: window.location.pathname,
      referrer: document.referrer
    });
  },

  // Track user actions
  trackEvent: (eventName: string, eventParams?: Record<string, any>) => {
    // Track through Firebase compatibility layer
    analytics.logEvent(analyticsInstance, eventName, eventParams);
    
    // Also track directly with Supabase analytics
    supabaseAnalytics.trackUserAction({
      action: eventName,
      category: eventParams?.category || 'general',
      label: eventParams?.label,
      value: eventParams?.value
    });
  },

  // Track donations specifically
  trackDonation: (donationData: {
    amount: number;
    currency: string;
    donation_type: string;
    payment_method: string;
  }) => {
    // Track through Firebase compatibility layer
    analytics.logEvent(analyticsInstance, 'donation', {
      currency: donationData.currency,
      value: donationData.amount,
      donation_type: donationData.donation_type,
      payment_method: donationData.payment_method,
      timestamp: new Date().toISOString()
    });
    
    // Also track directly with Supabase analytics
    supabaseAnalytics.trackDonation({
      amount: donationData.amount,
      currency: donationData.currency,
      donation_type: donationData.donation_type as 'one-time' | 'monthly',
      payment_method: donationData.payment_method
    });
  },

  // Track user engagement
  trackEngagement: (engagementType: string, engagementParams?: Record<string, any>) => {
    // Track through Firebase compatibility layer
    analytics.logEvent(analyticsInstance, 'engagement', {
      engagement_type: engagementType,
      ...engagementParams
    });
    
    // Also track directly with Supabase analytics
    supabaseAnalytics.trackUserAction({
      action: 'engagement',
      category: engagementType,
      label: engagementParams?.label,
      value: engagementParams?.value
    });
  },

  // Track errors
  trackError: (errorType: string, errorMessage: string, errorParams?: Record<string, any>) => {
    // Track through Firebase compatibility layer
    analytics.logEvent(analyticsInstance, 'error', {
      error_type: errorType,
      error_message: errorMessage,
      ...errorParams
    });
    
    // Also track directly with Supabase analytics
    supabaseAnalytics.trackUserAction({
      action: 'error',
      category: errorType,
      label: errorMessage,
      value: 0
    });
  }
};
