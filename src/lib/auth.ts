// NextAuth.js configuration
// Supports Google, Yahoo, Twitter (X), Facebook social login, and email/password

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { getServerSession } from 'next-auth';
import type { Session, User, Account, Profile } from 'next-auth';
import type { UserTier, UserRole } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import bcrypt from 'bcryptjs';

import { prisma } from './db';
// Note: Yahoo OAuth is handled separately via custom /api/yahoo/* routes
// Only include providers that have credentials configured
const providers = [];

// Email/password credentials provider (Design System v2.0)
if (process.env['ENABLE_CREDENTIALS_AUTH'] !== 'false') {
  providers.push(
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
        async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.tier as UserTier,
          role: user.role as UserRole
        };
      }
    })
  );
}

// Google OAuth (required for now)
if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
  providers.push(
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    }),
  );
}

// Twitter OAuth (optional - add when needed)
if (process.env['TWITTER_CLIENT_ID'] && process.env['TWITTER_CLIENT_SECRET']) {
  providers.push(
    TwitterProvider({
      clientId: process.env['TWITTER_CLIENT_ID'],
      clientSecret: process.env['TWITTER_CLIENT_SECRET'],
    }),
  );
}

// Facebook OAuth (optional - add when needed)
if (process.env['FACEBOOK_CLIENT_ID'] && process.env['FACEBOOK_CLIENT_SECRET']) {
  providers.push(
    FacebookProvider({
      clientId: process.env['FACEBOOK_CLIENT_ID'],
      clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
    }),
  );
}

// Minimal runtime env presence log (remove after verification)
console.log('[auth] NEXTAUTH_URL:', process.env['NEXTAUTH_URL']);
console.log('[auth] NEXTAUTH_SECRET set:', Boolean(process.env['NEXTAUTH_SECRET']));

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  trustHost: true,
  // TEMP: allow linking same email across providers (dev only)
  allowDangerousEmailAccountLinking:
    process.env['NODE_ENV'] === 'development' || process.env['AUTH_LINK_ALLOW'] === '1',
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
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
        const { isAdminEmail } = await import('./rbac');

        if (isAdminEmail(user.email)) {
          // Update user role to admin if they're signing in (using new enum)
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        
        // For adapter users (OAuth), fetch tier/role from database
        // For credentials provider, user already has tier/role
        if ('tier' in user && 'role' in user) {
          // Credentials provider - already has enums
          token.tier = user.tier as UserTier;
          token.role = user.role as UserRole;
        } else {
          // OAuth provider - fetch from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
          });
          token.tier = (dbUser?.tier || 'FREE') as UserTier;
          token.role = (dbUser?.role || 'USER') as UserRole;
        }

        // Yahoo fields
        token.sub = 'sub' in user && user.sub ? (user.sub as string) : undefined;
        token.yah = 'yah' in user && user.yah ? (user.yah as string) : undefined;

        // Stripe fields
        token.stripeCustomerId = 'stripeCustomerId' in user && user.stripeCustomerId
          ? (user.stripeCustomerId as string)
          : undefined;
      }

      // Refresh user data from DB periodically (every request for credentials provider)
      if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string }
          });
          if (dbUser) {
            token.tier = dbUser.tier as UserTier;
            token.role = dbUser.role as UserRole;
          token.sub = dbUser.sub || undefined;
          token.yah = dbUser.yah || undefined;
          token.stripeCustomerId = dbUser.stripeCustomerId || undefined;
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Map all fields from token to session
      if (session.user && token) {
        session.user.id = token.id as string;

        // Design System v2.0 tier and role (from enum fields)
        // These are always set in JWT callback, so safe to assert
        session.user.tier = (token.tier || 'FREE') as UserTier;
        session.user.role = (token.role || 'USER') as UserRole;

        // Legacy role mapping for backward compatibility
        session.user.legacyRole = ('legacyRole' in token ? token.legacyRole :
          (token.role === 'ADMIN' ? 'admin' : token.role === 'USER' ? 'free' : 'free')) as
          | 'free'
          | 'pro'
          | 'team'
          | 'admin'
          | undefined;

        // Yahoo fields - require sub for Yahoo-authenticated users
        session.user.sub = token.sub as string | undefined;
        session.user.yah = token.yah as string | undefined;

        // Stripe fields - for paid feature gates
        session.user.stripeCustomerId = token.stripeCustomerId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const, // Use JWT for credentials provider compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env['NODE_ENV'] === 'development',
};

export default NextAuth(authOptions);

// v4 shim so existing `{ auth }` imports keep working
export async function auth() {
  return getServerSession(authOptions);
}
