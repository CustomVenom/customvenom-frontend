import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json() as { priceId?: string };
    
    if (!priceId) {
      return NextResponse.json({ ok: false, error: 'missing_price_id' }, { status: 400 });
    }

    const base = process.env.FRONTEND_BASE || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/checkout/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (e) {
    console.error('[Checkout Error]', e);
    return NextResponse.json({ ok: false, error: 'checkout_create_failed' }, { status: 500 });
  }
}
