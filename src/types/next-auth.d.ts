import { DefaultUser } from 'next-auth';
import type { UserTier, UserRole } from '@prisma/client';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: NonNullable<Session['user']> & {
      id: string;
      // Design System v2.0 - New enum system
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
    // Design System v2.0 - New enum system
    tier: UserTier; // 'FREE' | 'VIPER' | 'MAMBA'
    role: UserRole; // 'USER' | 'ADMIN' | 'DEVELOPER'
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
    yah?: {
      sub?: string;
      email?: string;
      expires_at?: number;
    };
    // Yahoo OAuth fields
    sub?: string;
  }
}
