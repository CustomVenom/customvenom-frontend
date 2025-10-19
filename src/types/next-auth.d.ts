import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: NonNullable<Session['user']> & {
      id: string;
      role?: 'free' | 'pro' | 'team' | 'admin';
      sub?: string | null;
      stripeCustomerId?: string;
    };
  }

  interface User {
    role?: 'free' | 'pro' | 'team' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: 'free' | 'pro' | 'team' | 'admin';
    stripeCustomerId?: string;
    yah?: {
      sub?: string;
      email?: string;
      expires_at?: number;
    };
  }
}
