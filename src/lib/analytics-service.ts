import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalyticsEvent, DonationAnalytics } from '@/types';

const ANALYTICS_COLLECTION = 'analytics_events';

export async function trackEvent(event: DonationAnalytics | AnalyticsEvent) {
  try {
    const analyticsRef = collection(db, ANALYTICS_COLLECTION);
    await addDoc(analyticsRef, {
      event_type: event.eventType,
      timestamp: event.timestamp || serverTimestamp(),
      amount: 'amount' in event ? event.amount : undefined,
      currency: 'currency' in event ? event.currency : undefined,
      payment_method: 'paymentMethod' in event ? event.paymentMethod : undefined,
      metadata: event.metadata || {},
      environment: import.meta.env.MODE
    });

    return true;
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
