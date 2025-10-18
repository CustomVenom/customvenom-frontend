import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: NonNullable<Session['user']> & {
      id: string;
      role?: 'free' | 'pro' | 'team' | 'admin';
      sub?: string | null;
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
    yah?: {
      sub?: string;
      email?: string;
      expires_at?: number;
    };
  }
}
