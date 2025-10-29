// Middleware for route protection
// Handles demo mode and paywall bypass for development

import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Force apex to www
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com';
    return Response.redirect(url, 308);
  }

  return;
}

// Apply to all routes (pages + API)
export const config = { matcher: ['/(.*)'] };
