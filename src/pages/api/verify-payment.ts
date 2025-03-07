import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if this is a Flutterwave transaction or a Stripe session
  const { session_id, transaction_id } = req.query;

  if (transaction_id && typeof transaction_id === 'string') {
    // Handle Flutterwave verification
    return verifyFlutterwavePayment(transaction_id, res);
  } else if (session_id && typeof session_id === 'string') {
    // Handle Stripe verification
    return verifyStripePayment(session_id, res);
  } else {
    return res.status(400).json({ message: 'Missing session ID or transaction ID' });
  }
}

async function verifyStripePayment(sessionId: string, res: NextApiResponse) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.status(200).json({
      status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Stripe payment verification error:', error);
    res.status(500).json({
      message: 'Error verifying Stripe payment',
    });
  }
}

async function verifyFlutterwavePayment(transactionId: string, res: NextApiResponse) {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status === 'success' && data.status === 'successful') {
      return res.status(200).json({
        status: 'complete',
        metadata: data,
      });
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Flutterwave payment verification error:', error);
    return res.status(500).json({
      message: 'Error verifying Flutterwave payment',
    });
  }
}
