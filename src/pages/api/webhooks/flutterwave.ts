import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
// Supabase import removed - using Firebase instead;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the signature from the headers
    const signature = req.headers['verif-hash'];
    
    // Verify the webhook signature
    if (!signature || signature !== process.env.VITE_FLUTTERWAVE_SECRET_HASH) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the webhook payload
    const payload = req.body;
    
    // Log the webhook payload for debugging
    console.log('Flutterwave webhook payload:', JSON.stringify(payload, null, 2));

    // Process based on event type
    const { event, data } = payload;

    switch (event) {
      case 'charge.completed':
        await handleChargeCompleted(data);
        break;
      case 'transfer.completed':
        await handleTransferCompleted(data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    // Return a 200 response to acknowledge receipt of the webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Webhook handler failed' });
  }
}

async function handleChargeCompleted(data: any) {
  // Extract relevant data
  const {
    id,
    tx_ref,
    amount,
    currency,
    customer,
    status,
    payment_type,
    created_at,
  } = data;

  // Only process successful payments
  if (status !== 'successful') {
    console.log(`Payment ${id} not successful, status: ${status}`);
    return;
  }

  try {
    // Check if this transaction has already been processed
    const { data: existingDonation, error: checkError } = await supabase
      .from('donations')
      .select('id')
      .eq('payment_intent_id', id)
      .single();

    if (existingDonation) {
      console.log(`Transaction ${id} already processed`);
      return;
    }

    // Store the donation in the database
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        amount,
        currency,
        type: payment_type === 'recurring' ? 'monthly' : 'one-time',
        status: 'completed',
        payment_intent_id: id,
        provider: 'flutterwave',
        metadata: {
          tx_ref,
          customer_email: customer.email,
          customer_name: customer.name,
          payment_type,
          created_at,
        },
        // If you have user_id in the metadata, you can include it here
        // user_id: metadata.user_id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Donation recorded successfully: ${donation.id}`);
  } catch (error) {
    console.error('Error recording donation:', error);
    throw error;
  }
}

async function handleTransferCompleted(data: any) {
  // Handle transfer completed event if needed
  console.log('Transfer completed:', data.id);
}

async function handlePaymentFailed(data: any) {
  // Log failed payment
  console.error('Payment failed:', data.id, data.status);
  
  // You could store failed payments in a separate table or with a 'failed' status
  try {
    const { error } = await supabase
      .from('donations')
      .insert({
        amount: data.amount,
        currency: data.currency,
        type: data.payment_type === 'recurring' ? 'monthly' : 'one-time',
        status: 'failed',
        payment_intent_id: data.id,
        provider: 'flutterwave',
        metadata: {
          tx_ref: data.tx_ref,
          customer_email: data.customer?.email,
          customer_name: data.customer?.name,
          payment_type: data.payment_type,
          created_at: data.created_at,
          failure_reason: data.failure_reason || 'Unknown',
        },
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error recording failed payment:', error);
  }
} 