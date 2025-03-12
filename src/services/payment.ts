import { FlutterwaveConfig } from 'flutterwave-react-v3';
import { logPayment, logPaymentError, logPaymentSuccess } from './logService';

interface PaymentConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
}

export const initializePayment = (data: {
  amount: number;
  email: string;
  name: string;
  phone?: string;
}): PaymentConfig => {
  // Get the public key from environment variables with fallback for development
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 
                   (import.meta.env.DEV ? 'FLWPUBK_TEST-43f6b2c44c12c2a8e3f9068f9c6c1b2d-X' : '');
  
  if (!publicKey) {
    console.error('Flutterwave public key is missing');
    throw new Error('Payment configuration error: Missing API key');
  }
  
  const config: PaymentConfig = {
    public_key: publicKey,
    tx_ref: `hope-${Date.now()}`,
    amount: data.amount,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: data.email,
      name: data.name,
      phone_number: data.phone,
    },
    customizations: {
      title: 'HopeCare Donation',
      description: 'Supporting healthcare initiatives',
      logo: '/images/logo.png',
    },
  };

  // Log payment initialization
  logPayment(
    'Payment initialized', 
    { 
      amount: data.amount, 
      email: data.email, 
      name: data.name,
      tx_ref: config.tx_ref
    }
  );

  return config;
};

export const handlePaymentCallback = async (response: any) => {
  // Handle case where response is undefined or null
  if (!response) {
    const error = new Error('Payment response is empty');
    logPaymentError('Empty payment response', { error: error.message });
    throw error;
  }
  
  if (response.status === 'successful') {
    try {
      // Log successful payment from Flutterwave
      logPayment(
        'Payment successful from Flutterwave', 
        { 
          transaction_id: response.transaction_id,
          tx_ref: response.tx_ref,
          amount: response.amount,
          currency: response.currency
        }
      );

      // In development environment, mock the verification
      if (import.meta.env.DEV && !response.transaction_id) {
        console.log('Development mode: Mocking payment verification');
        return {
          status: 'complete',
          transaction_id: `dev-${Date.now()}`,
          amount: response.amount,
          currency: response.currency || 'USD',
          customer: {
            email: response.customer?.email || 'dev@example.com',
            name: response.customer?.name || 'Dev User'
          }
        };
      }

      const verificationResponse = await verifyTransaction(response.transaction_id);
      
      // Log verification result
      if (verificationResponse.status === 'complete') {
        logPaymentSuccess(
          'Payment verified successfully', 
          { 
            transaction_id: response.transaction_id,
            verification: verificationResponse
          }
        );
      } else {
        logPaymentError(
          'Payment verification failed', 
          { 
            transaction_id: response.transaction_id,
            verification: verificationResponse
          }
        );
      }
      
      return verificationResponse;
    } catch (error) {
      logPaymentError(
        'Payment verification error', 
        { 
          transaction_id: response.transaction_id || 'unknown',
          error: error instanceof Error ? error.message : String(error)
        }
      );
      console.error('Payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }
  
  logPaymentError(
    'Payment not successful', 
    { 
      status: response.status,
      transaction_id: response.transaction_id || 'unknown'
    }
  );
  
  throw new Error('Payment was not successful');
};

const verifyTransaction = async (transactionId: string) => {
  try {
    // In development environment, mock the API call
    if (import.meta.env.DEV && (!transactionId || transactionId.startsWith('dev-'))) {
      console.log('Development mode: Mocking transaction verification');
      return {
        status: 'complete',
        transaction_id: transactionId || `dev-${Date.now()}`,
        amount: 100,
        currency: 'USD',
        customer: {
          email: 'dev@example.com',
          name: 'Dev User'
        }
      };
    }
    
    const response = await fetch(`/api/verify-payment?transaction_id=${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logPaymentError(
        'Transaction verification API error', 
        { 
          transaction_id: transactionId,
          status: response.status,
          statusText: response.statusText,
          error: errorData
        }
      );
      throw new Error('Transaction verification failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logPaymentError(
      'Transaction verification exception', 
      { 
        transaction_id: transactionId,
        error: error instanceof Error ? error.message : String(error)
      }
    );
    throw error;
  }
}; 