// Middleware for route protection
// Currently minimal to stay under Edge Function size limits
// Pro-only route protection moved to page-level guards (requirePro helper)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // No middleware logic needed - all auth checks happen at page/API level
  // This keeps the Edge Function bundle small (<1MB for Vercel free tier)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

