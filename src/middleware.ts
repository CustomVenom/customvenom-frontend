// Middleware for route protection
// Handles demo mode and paywall bypass for development

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Force apex to www
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com';
    return Response.redirect(url, 308);
  }

  // Redirect /settings to /tools (single connect mode)
  if (url.pathname.startsWith('/settings')) {
    return NextResponse.redirect(new URL('/tools', url));
  }

  return NextResponse.next();
}

// Apply to all routes (pages + API)
export const config = { matcher: ['/(.*)'] };
