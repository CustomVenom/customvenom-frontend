// NextAuth.js configuration
// Supports Google, Yahoo, Twitter (X), and Facebook social login

import NextAuth, { NextAuthConfig } from 'next-auth';
import type { Session, User, Account, Profile } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import { YahooProvider } from './integrations/yahoo/provider';

// Only include providers that have credentials configured
const providers = [];

// Google OAuth (required for now)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Yahoo OAuth (Preview/Production when configured)
if (process.env.YAHOO_CLIENT_ID && process.env.YAHOO_CLIENT_SECRET) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers.push(YahooProvider as any);
}

// Twitter OAuth (optional - add when needed)
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })
  );
}

// Facebook OAuth (optional - add when needed)
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async signIn({
      user,
      account: _account,
      profile: _profile,
    }: {
      user: User;
      account?: Account | null;
      profile?: Profile;
    }) {
      // Auto-assign admin role to admin emails
      if (user.email && user.id) {
        const { isAdminEmail, ROLES } = await import('./rbac');

        if (isAdminEmail(user.email)) {
          // Update user role to admin if they're signing in
          await prisma.user.update({
            where: { id: user.id },
            data: { role: ROLES.ADMIN },
          });
        }
      }
      return true;
    },
    async session({ session, user }: { session: Session; user: User }) {
      // Map all fields from DB user to session
      if (session.user && user.id) {
        session.user.id = user.id;

        // Role mapping
        session.user.role = ('role' in user ? user.role : 'free') as
          | 'free'
          | 'pro'
          | 'team'
          | 'admin'
          | undefined;

        // Yahoo fields - require sub for Yahoo-authenticated users
        session.user.sub = 'sub' in user && user.sub ? (user.sub as string) : '';
        session.user.yah = 'yah' in user && user.yah ? (user.yah as string) : undefined;

        // Stripe fields - for paid feature gates
        session.user.stripeCustomerId =
          'stripeCustomerId' in user && user.stripeCustomerId
            ? (user.stripeCustomerId as string)
            : undefined;
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

// Export authOptions for App Router compatibility
export const authOptions = authConfig;

// Export authOptions for App Router compatibility
export const authOptions = authConfig;
