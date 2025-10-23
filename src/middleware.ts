// Middleware for route protection
// Handles demo mode and paywall bypass for development

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Force apex → WWW redirect (so the flow never splits hosts)
  const url = new URL(request.url);
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com';
    return NextResponse.redirect(url, 308);
  }

  // Paywall bypass for development
  if (process.env.PAYWALL_DISABLED === '1') {
    return NextResponse.next();
  }

  // Demo mode - allow anonymous access to public routes
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

  const publicRoutes = [
    '/',
    '/projections',
    '/status',
    '/privacy',
    '/terms',
    '/api/auth',
    '/api/yahoo',
  ];

  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isDemoMode && isPublicRoute) {
    return NextResponse.next();
  }

  // All other auth checks happen at page/API level
  // This keeps the Edge Function bundle small (<1MB for Vercel free tier)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth routes (NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|api/yahoo|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
