export interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  isPopular?: boolean;
}

export interface DonationDetails {
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  projectId?: string;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'card' | 'paypal' | 'mpesa';
  frequency: 'one-time' | 'monthly' | 'annually';
}

export interface PaymentSession {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  donationDetails: DonationDetails;
  createdAt: string;
  updatedAt: string;
  paymentProvider: string;
  paymentMethodDetails?: any;
  metadata?: Record<string, any>;
}

export type DonationEventType = 
  | 'donation_completed'
  | 'tier_selected'
  | 'amount_input'
  | 'payment_method_selected'
  | 'donation_shared';

export interface DonationAnalytics {
  eventType: DonationEventType;
  amount?: number;
  currency?: string;
  tierId?: string;
  paymentMethod?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
