import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ message: 'Missing session ID' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.status(200).json({
      status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Error verifying payment',
    });
  }
}
