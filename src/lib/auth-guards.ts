// Runtime validation guards for auth features

import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

/**
 * Validate Yahoo session has required fields
 * Use before calling Yahoo Fantasy APIs
 */
export function requireYahooAuth(
  session: Session | null
): asserts session is Session & { user: { sub: string } } {
  if (!session?.user?.sub) {
    throw new Error('Yahoo authentication required');
  }
}

/**
 * Validate Stripe customer for paid features
 * Redirects to /billing if not a paying customer
 */
export function requirePaidSubscription(session: Session | null) {
  if (!session?.user?.stripeCustomerId) {
    redirect('/billing');
  }
}

/**
 * Check if user has paid subscription (boolean)
 * Use for conditional rendering
 */
export function hasPaidSubscription(session: Session | null): boolean {
  return Boolean(session?.user?.stripeCustomerId);
}

/**
 * Check if user has Yahoo connection (boolean)
 * Use for conditional rendering
 */
export function hasYahooConnection(session: Session | null): boolean {
  return Boolean(session?.user?.sub);
}
