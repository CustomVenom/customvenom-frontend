// Stripe Customer Portal
// Creates a billing portal session for Pro users to manage their subscription

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from '@/lib/auth-helpers';

const stripe = process.env['STRIPE_SECRET_KEY']
  ? new Stripe(process.env['STRIPE_SECRET_KEY'], { apiVersion: '2024-06-20' })
  : null;

export async function POST() {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  try {
    // Require authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Require Pro subscription
    if (session.user.role !== 'pro') {
      return NextResponse.json(
        { error: 'Pro subscription required' },
        { status: 403 }
      );
    }

    // Require Stripe customer ID
    if (!session.user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.user.stripeCustomerId,
      return_url: `${process.env['NEXTAUTH_URL'] || 'http://localhost:3000'}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}


