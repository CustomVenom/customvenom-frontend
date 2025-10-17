// Stripe webhook handler
// Handles subscription events and updates user role to 'pro'

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 * Upgrades user to Pro and stores Stripe customer ID
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const userEmail = session.metadata?.userEmail || session.customer_email;

  if (!userId && !userEmail) {
    console.error('Missing user identifier in checkout session');
    return;
  }

  try {
    // Find user and update to Pro
    const user = await prisma.user.update({
      where: userId ? { id: userId } : { email: userEmail! },
      data: {
        role: 'pro',
        stripeCustomerId: session.customer as string,
      },
    });

    console.log(`User ${user.email} upgraded to Pro (customer: ${session.customer})`);
  } catch (error) {
    console.error('Failed to upgrade user to Pro:', error);
  }
}

/**
 * Handle subscription updates
 * Ensures user remains Pro while subscription is active
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`User not found for customer ${customerId}`);
      return;
    }

    // Update to Pro if subscription is active
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'pro' },
      });
      console.log(`User ${user.email} subscription updated to Pro`);
    }
  } catch (error) {
    console.error('Failed to handle subscription update:', error);
  }
}

/**
 * Handle subscription cancellation
 * Downgrades user back to free tier
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`User not found for customer ${customerId}`);
      return;
    }

    // Downgrade to free
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'free' },
    });

    console.log(`User ${user.email} downgraded to free`);
  } catch (error) {
    console.error('Failed to handle subscription deletion:', error);
  }
}

