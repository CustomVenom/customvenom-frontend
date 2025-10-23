// Middleware for route protection
// Handles demo mode and paywall bypass for development

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com';
    return Response.redirect(url, 308);
  }
  return;
}

// do not intercept OAuth endpoints
export const config = { matcher: ['/((?!api/yahoo).*)'] };
