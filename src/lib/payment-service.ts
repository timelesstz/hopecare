import { FlutterwaveConfig } from 'flutterwave-react-v3';
import { v4 as uuidv4 } from 'uuid';
import { env } from '@/utils/envUtils';

export interface PaymentDetails {
  amount: number;
  currency: string;
  projectId?: string;
  tierId?: string;
  donationType: 'one-time' | 'monthly';
  metadata?: Record<string, any>;
  email?: string;
  name?: string;
  phone?: string;
}

class PaymentService {
  getFlutterwaveConfig(details: PaymentDetails): FlutterwaveConfig {
    const txRef = `hopecare-${uuidv4()}`;
    
    // Store donation details in session storage for success page
    sessionStorage.setItem('donation_details', JSON.stringify({
      amount: details.amount,
      projectId: details.projectId,
      donationType: details.donationType,
      txRef: txRef
    }));
    
    return {
      public_key: env.FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: txRef,
      amount: details.amount,
      currency: details.currency || 'USD',
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: details.email || 'donor@example.com',
        phone_number: details.phone || '',
        name: details.name || 'Anonymous Donor',
      },
      customizations: {
        title: 'HopeCare Donation',
        description: `${details.donationType === 'monthly' ? 'Monthly' : 'One-time'} donation to HopeCare`,
        logo: 'https://hopecaretz.org/logo.png',
      },
      meta: {
        projectId: details.projectId || '',
        tierId: details.tierId || '',
        donationType: details.donationType,
        ...details.metadata
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/verify-payment?transaction_id=${transactionId}`);
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
