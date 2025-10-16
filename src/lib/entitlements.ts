import Stripe from 'stripe';

export interface Entitlements {
  isPro: boolean;
  features: {
    compareView: boolean;
    csvExport: boolean;
    recapEmail: boolean;
  };
}

const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function getEntitlements(sessionId?: string): Promise<Entitlements> {
  try {
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY missing');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const customerId = session.customer as string;
        const subs = await stripe.subscriptions.list({ 
          customer: customerId, 
          status: 'active', 
          limit: 1 
        });
        const isPro = subs.data.length > 0;
        return {
          isPro,
          features: { compareView: isPro, csvExport: isPro, recapEmail: isPro }
        };
      }
    }
  } catch (err) {
    console.error('Stripe entitlement check failed', err);
  }
  
  return { 
    isPro: false, 
    features: { compareView: false, csvExport: false, recapEmail: false } 
  };
}

// Check if user has specific feature access
export function hasFeature(entitlements: Entitlements, feature: keyof Entitlements['features']): boolean {
  return entitlements.features[feature];
}
