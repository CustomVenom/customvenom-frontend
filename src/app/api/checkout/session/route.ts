// Simple checkout session for Preview testing
// No database writes, just redirects to Stripe test checkout

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Only initialize if Stripe is configured
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export async function POST() {
  // Check if Stripe is configured
  if (!stripe || !process.env.NEXT_PUBLIC_CHECKOUT_PRICE) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  try {
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ 
        price: process.env.NEXT_PUBLIC_CHECKOUT_PRICE, 
        quantity: 1 
      }],
      success_url: `${process.env.NEXTAUTH_URL}/settings?pro=1`,
      cancel_url: `${process.env.NEXTAUTH_URL}/go-pro?canceled=1`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

