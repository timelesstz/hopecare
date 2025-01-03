import { supabase } from './supabase';
import type { AnalyticsEvent, DonationAnalytics } from '@/types';

const SUPABASE_ANALYTICS_TABLE = 'analytics_events';

export async function trackEvent(event: DonationAnalytics | AnalyticsEvent) {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_ANALYTICS_TABLE)
      .insert([{
        event_type: event.eventType,
        timestamp: event.timestamp || new Date().toISOString(),
        amount: 'amount' in event ? event.amount : undefined,
        currency: 'currency' in event ? event.currency : undefined,
        payment_method: 'paymentMethod' in event ? event.paymentMethod : undefined,
        metadata: event.metadata || {},
        environment: import.meta.env.MODE
      }]);

    if (error) {
      console.error('Error tracking analytics event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    // Don't throw error to prevent disrupting user flow
    return null;
  }
}

// Session tracking
let currentSession: string | null = null;

export function initSession(): string {
  currentSession = crypto.randomUUID();
  return currentSession;
}

export function getCurrentSession(): string {
  if (!currentSession) {
    return initSession();
  }
  return currentSession;
}

// User interaction tracking
export async function trackPageView(path: string) {
  return trackEvent({
    eventType: 'page_view',
    timestamp: new Date().toISOString(),
    metadata: {
      path,
      session: getCurrentSession(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }
  });
}

export async function trackInteraction(element: string, action: string, metadata?: Record<string, any>) {
  return trackEvent({
    eventType: 'user_interaction',
    timestamp: new Date().toISOString(),
    metadata: {
      element,
      action,
      session: getCurrentSession(),
      ...metadata
    }
  });
}

// Error tracking
export async function trackError(error: Error, context?: Record<string, any>) {
  return trackEvent({
    eventType: 'error',
    timestamp: new Date().toISOString(),
    metadata: {
      error: error.message,
      stack: error.stack,
      context,
      session: getCurrentSession()
    }
  });
}

// Performance tracking
export async function trackPerformance(metric: string, value: number, context?: Record<string, any>) {
  return trackEvent({
    eventType: 'performance',
    timestamp: new Date().toISOString(),
    metadata: {
      metric,
      value,
      context,
      session: getCurrentSession()
    }
  });
}
