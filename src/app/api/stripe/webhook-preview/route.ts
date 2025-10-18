// Preview-only webhook handler
// Logs events but doesn't write to database
// Use this for testing Stripe integration before going live

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // required for raw body
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!sig || !whSecret) {
    return NextResponse.json({ error: 'missing_sig' }, { status: 400 });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, whSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'bad_sig', message: error.message }, { status: 400 });
  }

  // Log event for Preview testing
  console.log('🎉 Stripe webhook received:', {
    type: event.type,
    id: event.id,
    created: event.created,
  });

  if (event.type === 'checkout.session.completed') {
    // Preview-only entitlement toggle (no DB write)
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('entitlement_toggle_preview', {
      plan: process.env.NEXT_PUBLIC_ENTITLEMENT_PLAN || 'pro',
      session: session.id,
      customer: session.customer,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
    });

    console.log('✅ Preview mode: User would be upgraded to Pro (DB write skipped)');
  }

  return NextResponse.json({ ok: true, event_type: event.type });
}

