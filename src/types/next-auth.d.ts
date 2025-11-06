import { DefaultUser } from 'next-auth';
import type { UserTier, UserRole } from '@prisma/client';
import 'next-auth/jwt';

// CRITICAL: Extend @auth/core/adapters.AdapterUser (used by PrismaAdapter from @auth/prisma-adapter)
// This must be declared BEFORE any imports that use the adapter
declare module '@auth/core/adapters' {
  interface AdapterUser {
    tier: UserTier;
    role: UserRole;
  }
}

// CRITICAL: Extend next-auth/adapters.AdapterUser (for NextAuth's adapter type)
declare module 'next-auth/adapters' {
  interface AdapterUser {
    tier: UserTier;
    role: UserRole;
  }
}

declare module 'next-auth' {
  interface Session {
    user: NonNullable<Session['user']> & {
      id: string;
      // Design System v2.0 - New enum system (required in session after JWT callback)
      tier: UserTier; // 'FREE' | 'VIPER' | 'MAMBA'
      role: UserRole; // 'USER' | 'ADMIN' | 'DEVELOPER'
      // Legacy role (backward compatibility - optional)
      legacyRole?: 'free' | 'pro' | 'team' | 'admin';
      // Yahoo
      sub?: string;
      yah?: string;
      // Stripe
      stripeCustomerId?: string;
    };
  }

  interface User extends DefaultUser {
    // Design System v2.0 - New enum system (optional for adapter compatibility)
    tier?: UserTier; // 'FREE' | 'VIPER' | 'MAMBA'
    role?: UserRole; // 'USER' | 'ADMIN' | 'DEVELOPER'
    sub?: string;
    yah?: string;
    stripeCustomerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    // Design System v2.0 - New enum system
    tier: UserTier; // 'FREE' | 'VIPER' | 'MAMBA'
    role: UserRole; // 'USER' | 'ADMIN' | 'DEVELOPER'
    stripeCustomerId?: string;
    // Yahoo OAuth fields
    sub?: string;
    yah?: string; // Yahoo user ID as string
  }
}
