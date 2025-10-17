// Simple checkout session for Preview testing
// No database writes, just redirects to Stripe test checkout

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST() {
  // Check for required price ID
  if (!process.env.NEXT_PUBLIC_CHECKOUT_PRICE) {
    return NextResponse.json({ error: 'price_missing' }, { status: 400 });
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

