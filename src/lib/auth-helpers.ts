// Auth helper functions for server components and API routes

import { redirect } from 'next/navigation';
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';

import { authOptions } from './auth';

/**
 * Get the current session (server-side only)
 * Use this in Server Components and API routes
 */
export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Require authentication
 * Redirects to home page if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/');
  }

  return session;
}

/**
 * Require Pro subscription
 * Redirects to /go-pro if user is not Pro
 */
export async function requirePro() {
  const session = await requireAuth();

  if (session.user.role !== 'pro') {
    redirect('/go-pro');
  }

  return session;
}

/**
 * Check if user is Pro (boolean check)
 * Use this for conditional rendering
 */
export async function isPro() {
  const session = await getServerSession();
  return session?.user?.role === 'pro';
}

/**
 * Check if user is authenticated (boolean check)
 * Use this for conditional rendering
 */
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session?.user;
}

/**
 * Require paid subscription
 * Redirects to /billing if user doesn't have stripeCustomerId
 */
export async function requirePaid() {
  const session = await requireAuth();

  if (!session.user.stripeCustomerId) {
    redirect('/billing');
  }

  return session;
}

/**
 * Check if user has paid subscription (boolean check)
 */
export async function hasPaid() {
  const session = await getServerSession();
  return Boolean(session?.user?.stripeCustomerId);
}
