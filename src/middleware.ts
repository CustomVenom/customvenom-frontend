// Middleware for route protection
// Handles tier-based access control and domain redirects

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const TIER_HIERARCHY = { FREE: 0, VIPER: 1, MAMBA: 2 }

// Routes that require specific tiers
const TIER_ROUTES = {
  FREE: ['/'],
  VIPER: ['/dashboard', '/dashboard/roster', '/dashboard/players', '/dashboard/start-sit', '/dashboard/faab', '/dashboard/decisions'],
  MAMBA: ['/dashboard/killshots', '/dashboard/faceoff', '/dashboard/strike-ranges']
}

// Public routes - always allowed
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = new URL(request.url)

  // Force apex to www (preserve existing functionality)
  if (url.hostname === 'customvenom.com') {
    url.hostname = 'www.customvenom.com'
    return NextResponse.redirect(url, 308)
  }

  // Public routes - always allow
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Yahoo OAuth routes - always allow (preserve existing functionality)
  if (pathname.startsWith('/api/yahoo') || pathname.startsWith('/api/oauth/yahoo')) {
    return NextResponse.next()
  }

  // Static files and Next.js internals - always allow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/account')) {
    const token = await getToken({
      req: request,
      secret: process.env['NEXTAUTH_SECRET'] || process.env['AUTH_SECRET']
    })

    // Not authenticated - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Get user tier from token (default to FREE)
    const userTier = ((token.tier as string) || 'FREE') as 'FREE' | 'VIPER' | 'MAMBA'

    // Mamba routes (most restrictive) - /dashboard/killshots, /dashboard/faceoff, etc.
    if (pathname.match(/\/(killshots|faceoff|strike-ranges)/)) {
      if (userTier !== 'MAMBA') {
        const redirectUrl = new URL('/dashboard', request.url)
        redirectUrl.searchParams.set('upgrade', 'mamba')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Viper routes (basic dashboard access) - require VIPER or MAMBA
    // Note: For development, we may want to allow FREE users to view dashboard
    // In production, uncomment the tier check below
    if (pathname.startsWith('/dashboard')) {
      // Allow VIPER and MAMBA tiers to access dashboard
      // Development mode: Allow all authenticated users (comment out in production)
      const isDevelopment = process.env['NODE_ENV'] === 'development'
      if (!isDevelopment && userTier === 'FREE') {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('upgrade', 'viper')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Account page requires authentication (already checked above)
    if (pathname.startsWith('/account')) {
      return NextResponse.next()
    }
  }

  // Allow all other routes through
  return NextResponse.next()
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
}
