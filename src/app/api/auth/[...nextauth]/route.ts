// NextAuth.js API route handler
// Handles all authentication routes: /api/auth/*

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

