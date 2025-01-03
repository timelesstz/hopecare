import { supabase } from './supabaseClient';

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

      const { data: userData } = await supabase.auth.getUser();
      
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: userData.user?.id,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        page_url: window.location.href,
      };

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          const { error } = await supabase
            .from('analytics_events')
            .insert([analyticsEvent]);

          if (error) throw error;

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
      
      // Don't throw the error to prevent app crashes
      return null;
    }
  }

  private sendToRealTimeAnalytics(event: AnalyticsEvent) {
    // Send event to real-time channel for live dashboard updates
    supabase
      .channel('analytics')
      .send({
        type: 'broadcast',
        event: 'analytics',
        payload: event,
      });
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
    let query = supabase
      .from('analytics_events')
      .select('*');

    if (options.startDate) {
      query = query.gte('timestamp', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('timestamp', options.endDate);
    }
    if (options.eventType) {
      query = query.eq('event_type', options.eventType);
    }
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getDonationMetrics(startDate?: string, endDate?: string) {
    const query = supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'donation');

    if (startDate) query.gte('timestamp', startDate);
    if (endDate) query.lte('timestamp', endDate);

    const { data, error } = await query;
    if (error) throw error;

    const metrics = {
      totalDonations: 0,
      totalAmount: 0,
      averageDonation: 0,
      recurringDonations: 0,
      oneTimeDonations: 0,
    };

    data.forEach((event: DonationEvent) => {
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
  }

  async getUserMetrics(startDate?: string, endDate?: string) {
    const query = supabase
      .from('analytics_events')
      .select('*')
      .in('event_type', ['page_view', 'user_action']);

    if (startDate) query.gte('timestamp', startDate);
    if (endDate) query.lte('timestamp', endDate);

    const { data, error } = await query;
    if (error) throw error;

    const metrics = {
      totalPageViews: 0,
      uniqueVisitors: new Set(),
      mostViewedPages: new Map<string, number>(),
      userActions: new Map<string, number>(),
    };

    data.forEach((event: PageView | UserEvent) => {
      if (event.event_type === 'page_view') {
        metrics.totalPageViews++;
        if (event.user_id) metrics.uniqueVisitors.add(event.user_id);
        
        const path = (event as PageView).properties.path;
        metrics.mostViewedPages.set(
          path,
          (metrics.mostViewedPages.get(path) || 0) + 1
        );
      } else if (event.event_type === 'user_action') {
        const action = (event as UserEvent).properties.action;
        metrics.userActions.set(
          action,
          (metrics.userActions.get(action) || 0) + 1
        );
      }
    });

    return {
      ...metrics,
      uniqueVisitors: metrics.uniqueVisitors.size,
      mostViewedPages: Object.fromEntries(metrics.mostViewedPages),
      userActions: Object.fromEntries(metrics.userActions),
    };
  }
}

export const analytics = new Analytics();

export const initializeAnalytics = () => {
  // Initialize analytics service
  try {
    // Add initialization logic here
    console.log('Analytics initialized');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};
