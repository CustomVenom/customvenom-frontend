import Stripe from 'stripe';

// import { getServerSession } from './auth-helpers';
import { getEntitlementsFromRole, getRoleFromSubscription, ROLES, type Role } from './rbac';

export interface Entitlements {
  role: Role;
  isAdmin: boolean;
  isPro: boolean;
  isTeam: boolean;
  isFree: boolean;
  features: {
    compareView: boolean;
    csvExport: boolean;
    recapEmail: boolean;
    analytics: boolean;
    multipleLeagues: boolean;
    adminDashboard: boolean;
  };
}

const stripeKey = process.env['STRIPE_SECRET_KEY'];

/**
 * Get entitlements from current session
 * Uses RBAC system with admin email override
 * DISABLED FOR DEVELOPMENT - Always returns admin entitlements
 */
export async function getEntitlements(): Promise<Entitlements> {
  // DISABLED FOR DEVELOPMENT - Always return admin entitlements
  return getEntitlementsFromRole(ROLES.ADMIN);
}

/**
 * Get entitlements from Stripe checkout session (for webhook processing)
 */
export async function getEntitlementsFromCheckout(sessionId: string): Promise<Entitlements> {
  try {
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY missing');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const customerId = session.customer as string;
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subs.data.length > 0) {
        const sub = subs.data[0];
        if (sub) {
          const tier = sub.items.data[0]?.price.metadata?.['tier'] || 'pro';
          const role = getRoleFromSubscription('active', tier);
          return getEntitlementsFromRole(role);
        }
      }
    }
  } catch (err) {
    console.error('Stripe entitlement check failed', err);
  }

  return getEntitlementsFromRole(ROLES.FREE);
}

// Check if user has specific feature access
export function hasFeature(
  entitlements: Entitlements,
  feature: keyof Entitlements['features'],
): boolean {
  return entitlements.features[feature];
}
