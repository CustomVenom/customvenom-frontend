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
 * Require Pro subscription (VIPER or MAMBA tier)
 * Redirects to /account if user is FREE tier
 */
export async function requirePro() {
  const session = await requireAuth();

  if (session.user.tier === 'FREE') {
    redirect('/account?upgrade=viper');
  }

  return session;
}

/**
 * Check if user is Pro (VIPER or MAMBA tier)
 * Use this for conditional rendering
 */
export async function isPro() {
  const session = await getServerSession();
  return session?.user?.tier === 'VIPER' || session?.user?.tier === 'MAMBA';
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
