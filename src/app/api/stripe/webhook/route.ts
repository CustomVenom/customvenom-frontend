import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  if (!sig || !webhookSecret) {
    console.error('[Stripe Webhook] Missing signature or secret');
    return NextResponse.json({ ok: false, error: 'config_error' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Step 3: Just log and return 2xx
    console.log(`[Stripe Webhook] ✅ Event: ${event.type}, ID: ${event.id}`);

    // Log event data for verification
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[Stripe Webhook] Customer: ${session.customer_email || session.customer_details?.email}`,
      );
      console.log(`[Stripe Webhook] Subscription: ${session.subscription}`);
    }

    return NextResponse.json({ ok: true, received: true }, { status: 200 });
  } catch (err) {
    console.error('[Stripe Webhook Error]', err);
    return NextResponse.json({ ok: false, error: 'webhook_failed' }, { status: 400 });
  }
}
