// NextAuth.js API Route Handler
// Provides /api/auth/* routes (signin, callback, session, etc.)

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

