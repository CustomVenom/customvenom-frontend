// NextAuth.js configuration
// Supports Google, Yahoo, Twitter (X), and Facebook social login

import NextAuth, { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';
import { prisma } from './db';
import { YahooProvider } from './integrations/yahoo/provider';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    YahooProvider as any, // Yahoo Fantasy (Priority #1)
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0', // Twitter API v2
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user role to session for easy access
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = 'role' in user ? (user.role as string) || 'free' : 'free';
        session.user.stripeCustomerId = 'stripeCustomerId' in user ? (user.stripeCustomerId as string | undefined) : undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign-in
    error: '/', // Redirect to home page on error
  },
  session: {
    strategy: 'database',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

