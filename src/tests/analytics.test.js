import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics } from '../lib/analytics-firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString())
}));

vi.mock('../lib/firebase', () => ({
  db: {}
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Firebase Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/test-page'
      },
      writable: true
    });
  });

  describe('Event Tracking', () => {
    it('should track a page view event', async () => {
      // Mock successful event tracking
      collection.mockReturnValueOnce('analytics-collection');
      addDoc.mockResolvedValueOnce({ id: 'event-id' });

      const pageViewProperties = {
        title: 'Test Page',
        referrer: 'https://example.com',
        path: '/test-page'
      };

      await analytics.trackPageView(pageViewProperties);

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.objectContaining({
        event_type: 'page_view',
        properties: pageViewProperties,
        page_url: 'https://example.com/test-page'
      }));
    });

    it('should track a donation event', async () => {
      // Mock successful event tracking
      collection.mockReturnValueOnce('analytics-collection');
      addDoc.mockResolvedValueOnce({ id: 'event-id' });

      const donationProperties = {
        amount: 100,
        currency: 'USD',
        donation_type: 'one-time',
        payment_method: 'card'
      };

      await analytics.trackDonation(donationProperties);

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.objectContaining({
        event_type: 'donation',
        properties: donationProperties,
        page_url: 'https://example.com/test-page'
      }));
    });

    it('should track a user action event', async () => {
      // Mock successful event tracking
      collection.mockReturnValueOnce('analytics-collection');
      addDoc.mockResolvedValueOnce({ id: 'event-id' });

      const userActionProperties = {
        action: 'button_click',
        category: 'engagement',
        label: 'donate_button'
      };

      await analytics.trackUserAction(userActionProperties);

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.objectContaining({
        event_type: 'user_action',
        properties: userActionProperties,
        page_url: 'https://example.com/test-page'
      }));
    });

    it('should store failed events in localStorage', async () => {
      // Mock failed event tracking
      collection.mockReturnValueOnce('analytics-collection');
      const mockError = new Error('Network error');
      addDoc.mockRejectedValueOnce(mockError);

      const pageViewProperties = {
        title: 'Test Page',
        referrer: 'https://example.com',
        path: '/test-page'
      };

      await analytics.trackPageView(pageViewProperties);

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.any(Object));
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Check that the failed event was stored in localStorage
      const storedEvents = JSON.parse(localStorageMock.getItem.mock.results[0].value || '[]');
      expect(storedEvents.length).toBeGreaterThan(0);
      expect(storedEvents[0].event).toEqual(expect.objectContaining({
        event_type: 'page_view',
        properties: pageViewProperties
      }));
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed events on initialization', async () => {
      // Mock successful event tracking for retry
      collection.mockReturnValueOnce('analytics-collection');
      addDoc.mockResolvedValueOnce({ id: 'event-id' });

      // Set up failed events in localStorage
      const failedEvents = [
        {
          event: {
            event_type: 'page_view',
            properties: {
              title: 'Failed Page',
              referrer: 'https://example.com',
              path: '/failed-page'
            }
          },
          timestamp: new Date().toISOString()
        }
      ];
      localStorageMock.setItem('failedAnalyticsEvents', JSON.stringify(failedEvents));

      await analytics.retryFailedEvents();

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.objectContaining({
        event_type: 'page_view',
        properties: expect.objectContaining({
          title: 'Failed Page'
        })
      }));
      
      // Check that localStorage was updated to remove the successful retry
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'failedAnalyticsEvents',
        '[]'
      );
    });

    it('should handle errors during retry', async () => {
      // Mock failed event tracking for retry
      collection.mockReturnValueOnce('analytics-collection');
      const mockError = new Error('Network error');
      addDoc.mockRejectedValueOnce(mockError);

      // Set up failed events in localStorage
      const failedEvents = [
        {
          event: {
            event_type: 'page_view',
            properties: {
              title: 'Failed Page',
              referrer: 'https://example.com',
              path: '/failed-page'
            }
          },
          timestamp: new Date().toISOString()
        }
      ];
      localStorageMock.setItem('failedAnalyticsEvents', JSON.stringify(failedEvents));

      await analytics.retryFailedEvents();

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(addDoc).toHaveBeenCalledWith('analytics-collection', expect.any(Object));
      
      // Check that localStorage still contains the failed event
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'failedAnalyticsEvents',
        expect.stringContaining('Failed Page')
      );
    });
  });

  describe('Analytics Retrieval', () => {
    it('should retrieve analytics data with filters', async () => {
      // Mock successful analytics retrieval
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'event-1',
            data: () => ({
              event_type: 'page_view',
              properties: {
                title: 'Home Page',
                path: '/'
              },
              timestamp: '2023-01-01T00:00:00.000Z'
            })
          },
          {
            id: 'event-2',
            data: () => ({
              event_type: 'page_view',
              properties: {
                title: 'About Page',
                path: '/about'
              },
              timestamp: '2023-01-02T00:00:00.000Z'
            })
          }
        ]
      };
      
      collection.mockReturnValueOnce('analytics-collection');
      query.mockReturnValueOnce('filtered-query');
      where.mockReturnValueOnce('where-clause');
      orderBy.mockReturnValueOnce('order-clause');
      getDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await analytics.getAnalytics({
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-01-31T23:59:59.999Z',
        eventType: 'page_view'
      });

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(where).toHaveBeenCalledWith('timestamp', '>=', '2023-01-01T00:00:00.000Z');
      expect(where).toHaveBeenCalledWith('timestamp', '<=', '2023-01-31T23:59:59.999Z');
      expect(where).toHaveBeenCalledWith('event_type', '==', 'page_view');
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(query).toHaveBeenCalledWith(
        'analytics-collection',
        'where-clause',
        'where-clause',
        'where-clause',
        'order-clause'
      );
      expect(getDocs).toHaveBeenCalledWith('filtered-query');
      
      expect(result).toEqual([
        {
          id: 'event-1',
          event_type: 'page_view',
          properties: {
            title: 'Home Page',
            path: '/'
          },
          timestamp: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          event_type: 'page_view',
          properties: {
            title: 'About Page',
            path: '/about'
          },
          timestamp: '2023-01-02T00:00:00.000Z'
        }
      ]);
    });

    it('should handle errors when retrieving analytics data', async () => {
      // Mock error during analytics retrieval
      const mockError = new Error('Failed to retrieve analytics');
      
      collection.mockReturnValueOnce('analytics-collection');
      query.mockReturnValueOnce('filtered-query');
      where.mockReturnValueOnce('where-clause');
      orderBy.mockReturnValueOnce('order-clause');
      getDocs.mockRejectedValueOnce(mockError);

      const result = await analytics.getAnalytics({
        eventType: 'page_view'
      });

      expect(collection).toHaveBeenCalledWith(db, 'analytics_events');
      expect(where).toHaveBeenCalledWith('event_type', '==', 'page_view');
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(query).toHaveBeenCalledWith(
        'analytics-collection',
        'where-clause',
        'order-clause'
      );
      expect(getDocs).toHaveBeenCalledWith('filtered-query');
      
      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });
}); 