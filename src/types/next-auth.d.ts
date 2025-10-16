// NextAuth type extensions
// Extends session to include user role and Stripe customer ID

import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      stripeCustomerId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    stripeCustomerId?: string;
  }
}

