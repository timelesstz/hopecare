import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, getDoc, doc } from 'firebase/firestore';

export interface AnalyticsEvent {
  id?: string;
  event_type: string;
  user_id?: string;
  properties: Record<string, any>;
  timestamp: string;
  page_url: string;
  session_id: string;
}

export interface PageView extends AnalyticsEvent {
  event_type: 'page_view';
  properties: {
    title: string;
    referrer: string;
    path: string;
  };
}

export interface DonationEvent extends AnalyticsEvent {
  event_type: 'donation';
  properties: {
    amount: number;
    currency: string;
    project_id?: string;
    donation_type: 'one-time' | 'monthly';
    payment_method: string;
  };
}

export interface UserEvent extends AnalyticsEvent {
  event_type: 'user_action';
  properties: {
    action: string;
    category: string;
    label?: string;
    value?: number;
  };
}

class FirebaseAnalytics {
  private sessionId: string;
  private readonly ANALYTICS_COLLECTION = 'analytics_events';

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'session_id'>) {
    try {
      // Add validation for required fields
      if (!event.event_type) {
        throw new Error('Event type is required');
      }

      // Get current user from Firebase Auth if available
      const user = null; // Replace with Firebase Auth user when implemented
      
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: user?.uid,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        page_url: window.location.href,
      };

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          await addDoc(collection(db, this.ANALYTICS_COLLECTION), analyticsEvent);
          return;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    } catch (error) {
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Analytics Error:', error);
      }
      
      // Store failed event for later retry
      this.storeFailedEvent(event);
      
      // Don't throw the error to prevent app crashes
      return null;
    }
  }

  private storeFailedEvent(event: any) {
    const failedEvents = JSON.parse(localStorage.getItem('failedAnalyticsEvents') || '[]');
    failedEvents.push({ event, timestamp: new Date().toISOString() });
    localStorage.setItem('failedAnalyticsEvents', JSON.stringify(failedEvents));
  }

  async retryFailedEvents() {
    const failedEvents = JSON.parse(localStorage.getItem('failedAnalyticsEvents') || '[]');
    if (failedEvents.length === 0) return;

    const successfulRetries = [];

    for (const { event } of failedEvents) {
      try {
        await this.trackEvent(event);
        successfulRetries.push(event);
      } catch (error) {
        console.error('Failed to retry event:', error);
      }
    }

    // Remove successful retries from failed events
    const remainingEvents = failedEvents.filter(
      ({ event }) => !successfulRetries.includes(event)
    );
    localStorage.setItem('failedAnalyticsEvents', JSON.stringify(remainingEvents));
  }

  async trackPageView(properties: PageView['properties']) {
    await this.trackEvent({
      event_type: 'page_view',
      properties,
    });
  }

  async trackDonation(properties: DonationEvent['properties']) {
    await this.trackEvent({
      event_type: 'donation',
      properties,
    });
  }

  async trackUserAction(properties: UserEvent['properties']) {
    await this.trackEvent({
      event_type: 'user_action',
      properties,
    });
  }

  async getAnalytics(options: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    userId?: string;
  }) {
    try {
      let constraints = [];
      
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate));
      }
      
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate));
      }
      
      if (options.eventType) {
        constraints.push(where('event_type', '==', options.eventType));
      }
      
      if (options.userId) {
        constraints.push(where('user_id', '==', options.userId));
      }
      
      const q = query(
        collection(db, this.ANALYTICS_COLLECTION),
        ...constraints,
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }

  async getDonationMetrics(startDate?: string, endDate?: string) {
    try {
      let constraints = [where('event_type', '==', 'donation')];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      const q = query(
        collection(db, this.ANALYTICS_COLLECTION),
        ...constraints
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const metrics = {
        totalDonations: 0,
        totalAmount: 0,
        averageDonation: 0,
        recurringDonations: 0,
        oneTimeDonations: 0,
      };

      data.forEach((event: any) => {
        metrics.totalDonations++;
        metrics.totalAmount += event.properties.amount;
        if (event.properties.donation_type === 'monthly') {
          metrics.recurringDonations++;
        } else {
          metrics.oneTimeDonations++;
        }
      });

      metrics.averageDonation = metrics.totalAmount / metrics.totalDonations || 0;

      return metrics;
    } catch (error) {
      console.error('Error fetching donation metrics:', error);
      return {
        totalDonations: 0,
        totalAmount: 0,
        averageDonation: 0,
        recurringDonations: 0,
        oneTimeDonations: 0,
      };
    }
  }

  async getUserMetrics(startDate?: string, endDate?: string) {
    try {
      let constraints = [where('event_type', 'in', ['page_view', 'user_action'])];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      const q = query(
        collection(db, this.ANALYTICS_COLLECTION),
        ...constraints
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const metrics = {
        totalPageViews: 0,
        uniqueVisitors: new Set<string>(),
        mostViewedPages: new Map<string, number>(),
        userActions: new Map<string, number>(),
        averageSessionDuration: 0,
      };

      data.forEach((event: any) => {
        if (event.event_type === 'page_view') {
          metrics.totalPageViews++;
          metrics.uniqueVisitors.add(event.session_id);
          
          const path = event.properties.path;
          metrics.mostViewedPages.set(
            path,
            (metrics.mostViewedPages.get(path) || 0) + 1
          );
        } else if (event.event_type === 'user_action') {
          const action = event.properties.action;
          metrics.userActions.set(
            action,
            (metrics.userActions.get(action) || 0) + 1
          );
        }
      });

      return {
        totalPageViews: metrics.totalPageViews,
        uniqueVisitors: metrics.uniqueVisitors.size,
        mostViewedPages: Object.fromEntries(metrics.mostViewedPages),
        userActions: Object.fromEntries(metrics.userActions),
        averageSessionDuration: 0, // Calculate this if you have session start/end events
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return {
        totalPageViews: 0,
        uniqueVisitors: 0,
        mostViewedPages: {},
        userActions: {},
        averageSessionDuration: 0,
      };
    }
  }
}

export const analytics = new FirebaseAnalytics();

export const initializeAnalytics = () => {
  // Set up listeners or initialize analytics as needed
  analytics.retryFailedEvents();
}; 