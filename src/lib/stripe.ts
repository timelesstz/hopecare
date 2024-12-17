import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  throw new Error('Missing Stripe publishable key');
}

// Initialize Stripe with proper error handling
export const stripePromise = loadStripe(stripeKey).catch(error => {
  console.error('Failed to load Stripe:', error);
  return null;
});