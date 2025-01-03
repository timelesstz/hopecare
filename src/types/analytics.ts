export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  referrer?: string;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
  dimensions?: Record<string, string>;
}
