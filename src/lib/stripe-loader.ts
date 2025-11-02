// Lazy-loaded Stripe utility
// Only loads Stripe.js when user interacts with payment UI
// This defers ~208KB of JS and 40+ requests until needed

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy-loaded on first call)
 * Caches the promise so subsequent calls return the same instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const stripeKey = process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'];

    if (!stripeKey) {
      console.warn('Stripe publishable key not configured');
      stripePromise = Promise.resolve(null);
      return stripePromise;
    }

    stripePromise = loadStripe(stripeKey);
  }

  return stripePromise;
}

