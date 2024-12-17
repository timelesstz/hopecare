import { describe, it, expect, beforeEach } from 'vitest';
import { analyticsTracker } from '../analytics';

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    // Reset analytics for each test
    analyticsTracker.startFormTracking('test-form');
  });

  it('tracks form start and completion', () => {
    const analytics = analyticsTracker.completeFormTracking('test-form');
    
    expect(analytics).toBeDefined();
    expect(analytics?.startTime).toBeDefined();
    expect(analytics?.completionTime).toBeDefined();
  });

  it('tracks step completion times', () => {
    analyticsTracker.trackStepCompletion('test-form', 1);
    analyticsTracker.trackStepCompletion('test-form', 2);

    const analytics = analyticsTracker.completeFormTracking('test-form');
    expect(analytics?.stepTimes[1]).toBeDefined();
    expect(analytics?.stepTimes[2]).toBeDefined();
  });

  it('tracks form errors', () => {
    analyticsTracker.trackError('test-form', 'email');
    analyticsTracker.trackError('test-form', 'email');
    analyticsTracker.trackError('test-form', 'password');

    const analytics = analyticsTracker.completeFormTracking('test-form');
    expect(analytics?.errors.email).toBe(2);
    expect(analytics?.errors.password).toBe(1);
  });
});