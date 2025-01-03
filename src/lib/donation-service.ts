import { stripePromise } from './stripe';
import { supabase } from './supabase';
import { trackEvent } from './analytics-service';
import type { DonationDetails, PaymentSession, DonationAnalytics } from '@/types';

export interface DonationDetails {
  amount: number;
  donationType: 'one-time' | 'monthly';
  recurringInterval?: 'monthly' | 'weekly' | 'biweekly';
  currency: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  projectId?: string;
  frequency?: string;
}

export interface PaymentSession {
  sessionId: string;
  provider: string;
  paymentUrl?: string;
}

export class DonationService {
  private static readonly UNLIMIT_API_URL = import.meta.env.VITE_UNLIMIT_API_URL;
  private static readonly UNLIMIT_MERCHANT_ID = import.meta.env.VITE_UNLIMIT_MERCHANT_ID;
  private static readonly UNLIMIT_API_KEY = import.meta.env.VITE_UNLIMIT_API_KEY;

  private static validateDonationDetails(details: DonationDetails) {
    const errors: string[] = [];

    // Amount validation
    if (!details.amount || details.amount <= 0) {
      errors.push('Please enter a valid donation amount');
    }
    if (details.amount < 10) {
      errors.push('Minimum donation amount is KES 10');
    }
    if (details.amount > 1000000) {
      errors.push('Maximum donation amount is KES 1,000,000');
    }

    // Currency validation
    if (!details.currency) {
      errors.push('Currency is required');
    }

    // Payment method validation
    if (!details.paymentMethod) {
      errors.push('Please select a payment method');
    }

    // Recurring donation validation
    if (details.donationType === 'monthly') {
      if (!details.recurringInterval) {
        errors.push('Please select a recurring interval');
      }
      if (!['monthly', 'weekly', 'biweekly'].includes(details.recurringInterval || '')) {
        errors.push('Invalid recurring interval');
      }
    }

    return errors;
  }

  static async createDonationSession(details: DonationDetails): Promise<PaymentSession> {
    try {
      // Validate donation details
      const errors = this.validateDonationDetails(details);
      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      }

      // Track the donation event
      await trackEvent({
        eventType: 'donation_started',
        amount: details.amount,
        currency: details.currency,
        paymentMethod: details.paymentMethod,
        timestamp: new Date().toISOString(),
        metadata: {
          projectId: details.projectId,
          frequency: details.frequency
        }
      } as DonationAnalytics);

      // Default to Unlimit payment
      const paymentMethod = details.paymentMethod || 'unlimit';

      if (paymentMethod === 'unlimit') {
        return await this.createUnlimitPayment(details);
      } else {
        return await this.createStripePayment(details);
      }
    } catch (error) {
      // Track the donation event
      await trackEvent({
        eventType: 'donation_failed',
        amount: details.amount,
        currency: details.currency,
        paymentMethod: details.paymentMethod,
        timestamp: new Date().toISOString(),
        metadata: {
          projectId: details.projectId,
          frequency: details.frequency,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      } as DonationAnalytics);

      console.error('Error creating payment session:', error);
      throw error;
    }
  }

  private static async createUnlimitPayment(details: DonationDetails): Promise<PaymentSession> {
    try {
      const payload = {
        merchant: this.UNLIMIT_MERCHANT_ID,
        amount: details.amount,
        currency: details.currency,
        country: 'KE',
        payment_type: details.donationType === 'monthly' ? 'RECURRING' : 'SINGLE',
        description: `Donation - ${details.donationType}`,
        metadata: {
          ...details.metadata,
          source: 'hopecare_donation'
        },
        success_url: `${window.location.origin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/donation/cancel`,
        ...(details.donationType === 'monthly' && {
          billing_cycle: {
            interval: details.recurringInterval || 'monthly',
            interval_count: 1
          }
        })
      };

      if (!this.UNLIMIT_API_URL || !this.UNLIMIT_MERCHANT_ID || !this.UNLIMIT_API_KEY) {
        throw new Error('Payment configuration is missing. Please contact support.');
      }

      const response = await fetch(`${this.UNLIMIT_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.UNLIMIT_API_KEY}`,
          'X-API-Version': '2023-11'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment service is currently unavailable. Please try again later.');
      }

      const data = await response.json();
      
      if (!data.session_id || !data.payment_url) {
        throw new Error('Invalid response from payment service');
      }

      return {
        sessionId: data.session_id,
        provider: 'unlimit',
        paymentUrl: data.payment_url
      };
    } catch (error) {
      console.error('Unlimit payment error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to initialize payment. Please try again later.');
    }
  }

  private static async createStripePayment(details: DonationDetails): Promise<PaymentSession> {
    try {
      if (!stripePromise) {
        throw new Error('Stripe is not properly configured');
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: details.amount,
          currency: details.currency,
          payment_type: details.donationType,
          metadata: {
            ...details.metadata,
            source: 'hopecare_donation'
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Stripe payment session');
      }

      const data = await response.json();

      if (!data.sessionId) {
        throw new Error('Invalid response from Stripe payment service');
      }

      return {
        sessionId: data.sessionId,
        provider: 'stripe',
        paymentUrl: data.url
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to initialize Stripe payment. Please try again later.');
    }
  }

  static async processPayment(sessionId: string, details: DonationDetails) {
    const provider = details.paymentMethod || 'unlimit';

    try {
      if (provider === 'unlimit') {
        // For Unlimit, we need to verify the payment status
        const response = await fetch(`${this.UNLIMIT_API_URL}/payments/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${this.UNLIMIT_API_KEY}`,
            'X-API-Version': '2023-11'
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to verify payment status');
        }

        const data = await response.json();
        
        if (data.status === 'COMPLETED') {
          await this.recordDonation({
            amount: details.amount,
            type: details.donationType,
            status: 'succeeded',
            paymentIntentId: data.id,
            provider,
            metadata: {
              ...details.metadata,
              payment_method: data.payment_method,
              transaction_id: data.transaction_id
            }
          });

          // Track the donation event
          await trackEvent({
            eventType: 'donation_completed',
            amount: details.amount,
            currency: details.currency,
            paymentMethod: provider,
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: details.projectId,
              frequency: details.frequency,
              transactionId: data.transaction_id
            }
          } as DonationAnalytics);

          return data;
        }
        
        if (data.status === 'FAILED') {
          // Track the donation event
          await trackEvent({
            eventType: 'donation_failed',
            amount: details.amount,
            currency: details.currency,
            paymentMethod: provider,
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: details.projectId,
              frequency: details.frequency,
              error: data.failure_reason || 'Payment failed'
            }
          } as DonationAnalytics);

          throw new Error(data.failure_reason || 'Payment failed');
        }
        
        if (data.status === 'PENDING') {
          throw new Error('Payment is still pending');
        }
        
        throw new Error('Payment not completed');
      } else {
        // Process Stripe payment
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe not initialized');

        const { paymentIntent, error } = await stripe.confirmCardPayment(sessionId);
        
        if (error) {
          // Track the donation event
          await trackEvent({
            eventType: 'donation_failed',
            amount: details.amount,
            currency: details.currency,
            paymentMethod: provider,
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: details.projectId,
              frequency: details.frequency,
              error: error.message
            }
          } as DonationAnalytics);

          throw error;
        }

        if (paymentIntent.status === 'succeeded') {
          await this.recordDonation({
            amount: details.amount,
            type: details.donationType,
            status: 'succeeded',
            paymentIntentId: paymentIntent.id,
            provider,
            metadata: details.metadata
          });

          // Track the donation event
          await trackEvent({
            eventType: 'donation_completed',
            amount: details.amount,
            currency: details.currency,
            paymentMethod: provider,
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: details.projectId,
              frequency: details.frequency,
              transactionId: paymentIntent.id
            }
          } as DonationAnalytics);
        }

        return paymentIntent;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  private static async recordDonation(donationData: {
    amount: number;
    type: string;
    status: string;
    paymentIntentId: string;
    provider: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const { error } = await supabase
        .from('donations')
        .insert([{
          ...donationData,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error recording donation:', error);
    }
  }

  static async setupRecurringPayment(details: DonationDetails) {
    const provider = details.paymentMethod || 'unlimit';
    
    try {
      if (provider === 'unlimit') {
        return await this.createUnlimitPayment({
          ...details,
          donationType: 'monthly'
        });
      } else {
        const response = await fetch('/api/setup-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(details),
        });

        if (!response.ok) {
          throw new Error('Failed to setup subscription');
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Error setting up subscription:', error);
      throw error;
    }
  }

  static async getPaymentMethods() {
    return [
      {
        id: 'unlimit',
        name: 'Pay with M-Pesa',
        icon: '/icons/mpesa-logo.svg',
        description: 'Fast and secure mobile payment',
        isDefault: true
      },
      {
        id: 'unlimit_card',
        name: 'Credit/Debit Card',
        icon: '/icons/card-icon.svg',
        description: 'Pay with Visa, Mastercard, or other cards',
        provider: 'unlimit'
      }
    ];
  }
}
