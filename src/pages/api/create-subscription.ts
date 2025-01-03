import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const getIntervalFromFrequency = (frequency: string) => {
  switch (frequency) {
    case 'monthly':
      return { interval: 'month', interval_count: 1 };
    case 'quarterly':
      return { interval: 'month', interval_count: 3 };
    case 'annually':
      return { interval: 'year', interval_count: 1 };
    default:
      throw new Error('Invalid frequency');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', frequency, metadata } = req.body;

    // First, create or retrieve the product
    const product = await stripe.products.create({
      name: 'Recurring Donation',
      type: 'service',
    });

    // Create a price for the subscription
    const { interval, interval_count } = getIntervalFromFrequency(frequency);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency,
      recurring: {
        interval: interval as Stripe.PriceRecurringInterval,
        interval_count,
      },
      metadata: {
        ...metadata,
        type: 'recurring_donation',
      },
    });

    res.status(200).json({
      priceId: price.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
}
