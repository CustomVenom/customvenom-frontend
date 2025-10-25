// Demo mode utilities

/**
 * Check if current user is anonymous (no authentication)
 * Replace with your actual auth check when NextAuth is wired
 */
export const isAnonymous = () => {
  // TODO: Wire to actual session check
  // import { useSession } from 'next-auth/react';
  // const { data: session } = useSession();
  // return !session?.user;

  return true; // For now, all users are anonymous
};

/**
 * Pinned week for anonymous users (Golden Week)
 */
export const pinnedWeekForAnon = '2025-06';

/**
 * Check if response is in demo mode
 */
export const isDemoMode = (headers: Headers): boolean => {
  return headers.get('x-demo-mode') === 'true';
};
