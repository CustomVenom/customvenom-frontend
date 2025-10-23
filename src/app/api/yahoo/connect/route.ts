import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
// Inline cookie helper to avoid import issues

const Y_AUTH = 'https://api.login.yahoo.com/oauth2/request_auth';

export async function GET(req: NextRequest) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host')!;
  const site = `${proto}://${host}`; // <-- single source of truth
  const redirectUri = `${site}/api/yahoo/callback`;
  const state = randomUUID();

  // Persist CSRF state for 10 minutes
  const response = NextResponse.redirect(
    `${Y_AUTH}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid profile email fspt-r')}&state=${encodeURIComponent(state)}`
  );

  // Set CSRF state cookie
  response.cookies.set('y_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}
