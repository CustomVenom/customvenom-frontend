// Middleware for route protection
// Protects Pro-only routes and redirects free users to /go-pro

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

// Define Pro-only routes
const PRO_ROUTES = [
  '/pro',
  // Add more Pro-only route patterns here
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path requires Pro subscription
  const requiresPro = PRO_ROUTES.some(route => pathname.startsWith(route));

  if (requiresPro) {
    // Get session
    const session = await auth();

    // Redirect to login if not authenticated
    if (!session?.user) {
      const url = new URL('/', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Redirect to go-pro if not Pro
    if (session.user.role !== 'pro') {
      return NextResponse.redirect(new URL('/go-pro', request.url));
    }
  }

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

