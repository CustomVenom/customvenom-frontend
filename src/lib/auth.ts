// NextAuth.js configuration
// Supports Google, Yahoo, Twitter (X), and Facebook social login

import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth';
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

// Minimal runtime env presence log (remove after verification)
console.log('[auth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[auth] NEXTAUTH_SECRET set:', Boolean(process.env.NEXTAUTH_SECRET));
console.log('[auth] YAHOO_CLIENT_ID set:', Boolean(process.env.YAHOO_CLIENT_ID));
console.log('[auth] YAHOO_CLIENT_SECRET set:', Boolean(process.env.YAHOO_CLIENT_SECRET));

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  trustHost: true,
  // TEMP: allow linking same email across providers (dev only)
  allowDangerousEmailAccountLinking: process.env.NODE_ENV === 'development',
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/tools/yahoo`;
    },
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
    // Remove custom signIn page to use NextAuth default
    error: '/auth/error', // Custom error page
  },
  session: {
    strategy: 'jwt' as const,
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

// v4 shim so existing `{ auth }` imports keep working
export async function auth() {
  return getServerSession(authOptions);
}
