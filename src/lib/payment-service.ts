import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentDetails {
  amount: number;
  currency: string;
  projectId?: string;
  tierId?: string;
  donationType: 'one-time' | 'monthly';
  metadata?: Record<string, any>;
}

class PaymentService {
  private async createStripeSession(details: PaymentDetails) {
    const response = await fetch('/api/create-payment-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment session');
    }

    return response.json();
  }

  async processPayment(details: PaymentDetails) {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const session = await this.createStripeSession(details);
      
      // Store donation details in session storage for success page
      sessionStorage.setItem('donation_details', JSON.stringify({
        amount: details.amount,
        projectId: details.projectId,
        donationType: details.donationType,
        sessionId: session.id
      }));

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      const { status } = await response.json();
      return status === 'complete';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
