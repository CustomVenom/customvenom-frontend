// Middleware for route protection
// Handles tier-based access control and domain redirects
// Architecture Law #4: Generates request IDs at the edge for traceability

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { getToken } from 'next-auth/jwt';

/**
 * Generate or extract request ID
 * Architecture Law #4: Every user request should have a unique ID at the edge
 */
function getOrCreateRequestId(request: NextRequest): string {
  // Check if request ID already exists in header (from upstream)
  const existingId = request.headers.get('x-request-id');
  if (existingId) {
    return existingId;
  }

  // Generate new request ID (simple UUID-like format)
  // In production, consider using crypto.randomUUID() if available
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `req-${timestamp}-${random}`;
}

// Public routes - always allowed
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = new URL(request.url);

  // Generate request ID at the edge for traceability
  const requestId = getOrCreateRequestId(request);

  // Force apex to www (preserve existing functionality)
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com';
    return NextResponse.redirect(url, 308);
  }

  // Public routes - always allow
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect legacy /league/* routes to /dashboard/*
  if (pathname.startsWith('/league/')) {
    const newPath = pathname.replace('/league/', '/dashboard/');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Yahoo OAuth routes - always allow (preserve existing functionality)
  if (pathname.startsWith('/api/yahoo') || pathname.startsWith('/api/oauth/yahoo')) {
    return NextResponse.next();
  }

  // Static files and Next.js internals - always allow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Dashboard routes - public access (Yahoo OAuth only, no CustomVenom login required)
  if (pathname.startsWith('/dashboard')) {
    // Allow all users to access dashboard - they'll connect via Yahoo OAuth
    return NextResponse.next();
  }

  // Account page - still requires CustomVenom authentication
  if (pathname.startsWith('/account')) {
    const secret = process.env['NEXTAUTH_SECRET'] || process.env['AUTH_SECRET'];
    if (!secret) {
      logger.error('[middleware] Missing NEXTAUTH_SECRET or AUTH_SECRET', {
        request_id: requestId,
        route: pathname,
      });
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const token = await getToken({
      req: request,
      secret,
    });

    // Not authenticated - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other routes through
  // Add request ID to response headers for traceability
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  return response;
}

// Apply to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)).*)',
  ],
};
