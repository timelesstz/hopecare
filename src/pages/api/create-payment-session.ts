import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      amount,
      currency = 'usd',
      projectId,
      tierId,
      donationType,
      metadata = {},
    } = req.body;

    // Create line items for Stripe
    const lineItems = [{
      price_data: {
        currency,
        product_data: {
          name: projectId 
            ? 'Project Donation'
            : 'General Donation',
          description: donationType === 'monthly' 
            ? 'Monthly recurring donation'
            : 'One-time donation',
        },
        unit_amount: Math.round(amount * 100), // Convert to cents
        recurring: donationType === 'monthly' ? { interval: 'month' } : undefined,
      },
      quantity: 1,
    }];

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: donationType === 'monthly' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donation?canceled=true`,
      metadata: {
        projectId,
        tierId,
        donationType,
        ...metadata,
      },
    });

    res.status(200).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({
      message: 'Error creating payment session',
    });
  }
}
