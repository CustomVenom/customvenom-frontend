import { DefaultUser } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: NonNullable<Session['user']> & {
      id: string;
      role?: 'free' | 'pro' | 'team' | 'admin';
      // Design System v2.0 - New tier system
      tier?: 'FREE' | 'VIPER' | 'MAMBA';
      // Legacy role (backward compatibility)
      legacyRole?: 'free' | 'pro' | 'team' | 'admin';
      // Yahoo
      sub: string;
      yah?: string;
      // Stripe
      stripeCustomerId?: string;
    };
  }

  interface User extends DefaultUser {
    role?: 'free' | 'pro' | 'team' | 'admin';
    // Design System v2.0 - New tier system
    tier?: 'FREE' | 'VIPER' | 'MAMBA';
    sub?: string;
    yah?: string;
    stripeCustomerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userId?: string;
    role?: 'free' | 'pro' | 'team' | 'admin';
    // Design System v2.0 - New tier system
    tier?: 'FREE' | 'VIPER' | 'MAMBA';
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
