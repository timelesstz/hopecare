import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

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
    const donationsCollection = collection(db, 'donations');
    const donationQuery = query(
      donationsCollection,
      where('payment_intent_id', '==', id)
    );
    
    const querySnapshot = await getDocs(donationQuery);
    
    if (!querySnapshot.empty) {
      console.log(`Transaction ${id} already processed`);
      return;
    }

    // Store the donation in Firestore
    await addDoc(donationsCollection, {
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
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    console.log(`Donation recorded successfully for transaction: ${id}`);
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
  
  // Store failed payments in Firestore
  try {
    const donationsCollection = collection(db, 'donations');
    
    await addDoc(donationsCollection, {
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
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording failed payment:', error);
  }
} 