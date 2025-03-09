import { FlutterwaveConfig } from 'flutterwave-react-v3';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentData {
  amount: number;
  currency?: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  metadata?: Record<string, string>;
  email?: string;
  name?: string;
  phone?: string;
}

/**
 * Creates a Flutterwave payment configuration
 */
export const createFlutterwaveConfig = (data: PaymentData): FlutterwaveConfig => {
  const txRef = `hopecare-${uuidv4()}`;
  
  return {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: txRef,
    amount: data.amount,
    currency: data.currency || 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: data.email || 'donor@example.com',
      phone_number: data.phone || '',
      name: data.name || 'Anonymous Donor',
    },
    customizations: {
      title: 'HopeCare Donation',
      description: `${data.frequency === 'one-time' ? 'One-time' : 'Recurring'} donation to HopeCare`,
      logo: 'https://hopecaretz.org/logo.png',
    },
    meta: {
      frequency: data.frequency,
      ...data.metadata
    },
  };
};

/**
 * Verifies a Flutterwave payment
 */
export const verifyPayment = async (transactionId: string): Promise<boolean> => {
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
}; 