import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { cmsService } from '@/lib/cms-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ message: 'Missing stripe signature' });
  }

  try {
    const rawBody = await buffer(req);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { projectId, donationType } = session.metadata || {};

        if (projectId) {
          // Update project stats
          await cmsService.updateProjectStats(projectId, {
            donorCount: 1,
            raisedAmount: session.amount_total ? session.amount_total / 100 : 0,
          });
        }

        // Here you can add more logic like:
        // - Sending confirmation emails
        // - Creating donation records in your database
        // - Updating donor statistics
        break;
      }

      case 'payment_intent.succeeded': {
        // Handle successful payment
        break;
      }

      case 'payment_intent.payment_failed': {
        // Handle failed payment
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      message: 'Webhook error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
