import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  orderBy,
  gte,
  lte
} from 'firebase/firestore';

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

class Analytics {
  private sessionId: string;

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

      // Get current user from Firebase Auth
      const currentUser = auth.currentUser;
      
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: currentUser?.uid,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        page_url: window.location.href,
      };

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          // Store event in Firestore
          const analyticsCollection = collection(db, 'analytics_events');
          await addDoc(analyticsCollection, {
            ...analyticsEvent,
            created_at: serverTimestamp(),
          });

          // Also send to real-time analytics if needed
          this.sendToRealTimeAnalytics(analyticsEvent);

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
      
      // Send error to error tracking service in production
      if (process.env.NODE_ENV === 'production') {
        // Implement error tracking service integration
        // e.g., Sentry, LogRocket, etc.
      }
      
      // Store failed event for retry
      this.storeFailedEvent(event);
      
      // Don't throw the error to prevent app crashes
      return null;
    }
  }

  private sendToRealTimeAnalytics(event: AnalyticsEvent) {
    // For Firebase, you might use Firebase Realtime Database or Cloud Functions
    // This is a placeholder for real-time analytics implementation
    console.log('Real-time analytics event:', event);
    
    // If you want to implement real-time updates, consider using:
    // 1. Firebase Realtime Database
    // 2. Cloud Functions to trigger on Firestore writes
    // 3. A separate service like Pusher or Socket.io
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
      const analyticsCollection = collection(db, 'analytics_events');
      
      // Build query constraints
      const constraints = [];
      
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
      
      // Add default sorting
      constraints.push(orderBy('timestamp', 'desc'));
      
      // Create and execute query
      const analyticsQuery = query(analyticsCollection, ...constraints);
      const querySnapshot = await getDocs(analyticsQuery);
      
      // Process results
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getDonationMetrics(startDate?: string, endDate?: string) {
    try {
      const analyticsCollection = collection(db, 'analytics_events');
      
      // Build query constraints
      const constraints = [where('event_type', '==', 'donation')];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      // Create and execute query
      const donationsQuery = query(analyticsCollection, ...constraints);
      const querySnapshot = await getDocs(donationsQuery);
      
      const metrics = {
        totalDonations: 0,
        totalAmount: 0,
        averageDonation: 0,
        recurringDonations: 0,
        oneTimeDonations: 0,
      };
      
      // Process results
      querySnapshot.forEach((doc) => {
        const event = doc.data() as DonationEvent;
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
      throw error;
    }
  }

  async getUserMetrics(startDate?: string, endDate?: string) {
    try {
      const analyticsCollection = collection(db, 'analytics_events');
      
      // Build query for page views and user actions
      const constraints = [
        where('event_type', 'in', ['page_view', 'user_action'])
      ];
      
      if (startDate) {
        constraints.push(where('timestamp', '>=', startDate));
      }
      
      if (endDate) {
        constraints.push(where('timestamp', '<=', endDate));
      }
      
      // Create and execute query
      const eventsQuery = query(analyticsCollection, ...constraints);
      const querySnapshot = await getDocs(eventsQuery);
      
      const metrics = {
        totalPageViews: 0,
        uniqueVisitors: new Set<string>(),
        uniqueSessionIds: new Set<string>(),
        popularPages: new Map<string, number>(),
        userActions: new Map<string, number>(),
        bounceRate: 0,
        averageSessionDuration: 0,
      };
      
      // Process results
      const sessions = new Map<string, { events: any[], duration: number }>();
      
      querySnapshot.forEach((doc) => {
        const event = doc.data() as AnalyticsEvent;
        
        // Track session data
        if (!sessions.has(event.session_id)) {
          sessions.set(event.session_id, { events: [], duration: 0 });
        }
        sessions.get(event.session_id)?.events.push(event);
        
        // Track metrics based on event type
        if (event.event_type === 'page_view') {
          metrics.totalPageViews++;
          
          if (event.user_id) {
            metrics.uniqueVisitors.add(event.user_id);
          }
          
          metrics.uniqueSessionIds.add(event.session_id);
          
          const path = event.properties.path;
          metrics.popularPages.set(path, (metrics.popularPages.get(path) || 0) + 1);
        } else if (event.event_type === 'user_action') {
          const action = event.properties.action;
          metrics.userActions.set(action, (metrics.userActions.get(action) || 0) + 1);
        }
      });
      
      // Calculate bounce rate and session duration
      let totalSessionDuration = 0;
      let bouncedSessions = 0;
      
      sessions.forEach(({ events }) => {
        if (events.length === 1 && events[0].event_type === 'page_view') {
          bouncedSessions++;
        }
        
        if (events.length > 1) {
          const timestamps = events.map(e => new Date(e.timestamp).getTime()).sort();
          const sessionDuration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000; // in seconds
          totalSessionDuration += sessionDuration;
        }
      });
      
      metrics.bounceRate = sessions.size ? (bouncedSessions / sessions.size) * 100 : 0;
      metrics.averageSessionDuration = sessions.size - bouncedSessions > 0 
        ? totalSessionDuration / (sessions.size - bouncedSessions) 
        : 0;
      
      return {
        ...metrics,
        uniqueVisitors: metrics.uniqueVisitors.size,
        uniqueSessionIds: metrics.uniqueSessionIds.size,
        popularPages: Array.from(metrics.popularPages.entries())
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count),
        userActions: Array.from(metrics.userActions.entries())
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count),
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw error;
    }
  }
}

export const analytics = new Analytics();

export const initializeAnalytics = () => {
  // Initialize analytics
  window.addEventListener('load', () => {
    // Track page view on initial load
    analytics.trackPageView({
      title: document.title,
      referrer: document.referrer,
      path: window.location.pathname,
    });
    
    // Retry any failed events
    analytics.retryFailedEvents();
  });
  
  return analytics;
};
