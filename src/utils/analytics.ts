interface FormAnalytics {
  startTime: number;
  stepTimes: Record<number, number>;
  errors: Record<string, number>;
  completionTime?: number;
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private analytics: Map<string, FormAnalytics> = new Map();

  private constructor() {}

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  startFormTracking(formId: string): void {
    this.analytics.set(formId, {
      startTime: Date.now(),
      stepTimes: {},
      errors: {}
    });
  }

  trackStepCompletion(formId: string, step: number): void {
    const analytics = this.analytics.get(formId);
    if (analytics) {
      analytics.stepTimes[step] = Date.now() - analytics.startTime;
    }
  }

  trackError(formId: string, fieldName: string): void {
    const analytics = this.analytics.get(formId);
    if (analytics) {
      analytics.errors[fieldName] = (analytics.errors[fieldName] || 0) + 1;
    }
  }

  completeFormTracking(formId: string): FormAnalytics | undefined {
    const analytics = this.analytics.get(formId);
    if (analytics) {
      analytics.completionTime = Date.now() - analytics.startTime;
      return analytics;
    }
    return undefined;
  }
}

export const analyticsTracker = AnalyticsTracker.getInstance();