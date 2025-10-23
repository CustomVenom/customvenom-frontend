import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

async function exchange(code: string, redirectUri: string) {
  const id = process.env.YAHOO_CLIENT_ID!;
  const secret = process.env.YAHOO_CLIENT_SECRET!;
  if (!id || !secret) throw new Error('missing_yahoo_keys');
  const basic = Buffer.from(`${id}:${secret}`).toString('base64');

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
    // Prevent edge caching weirdness
    cache: 'no-store',
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`token_exchange_${resp.status}:${text}`);
  return JSON.parse(text) as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function GET(req: NextRequest) {
  try {
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host')!;
    const site = `${proto}://${host}`;
    const redirectUri = `${site}/api/yahoo/callback`;

    const code = req.nextUrl.searchParams.get('code') || '';
    const state = req.nextUrl.searchParams.get('state') || '';
    const cookieStore = await cookies();
    const cookieState = cookieStore.get('y_state')?.value || '';

    if (!state || !cookieState || state !== cookieState) {
      return new NextResponse('Invalid OAuth state', { status: 400 });
    }
    // One-time use
    cookieStore.set({ name: 'y_state', value: '', path: '/', maxAge: 0 });

    if (!code) return new NextResponse('Missing code', { status: 400 });

    const tokens = await exchange(code, redirectUri);

    // Demo: set short-lived access token cookie
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `y_at=${encodeURIComponent(tokens.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`
    );
    if (tokens.refresh_token) {
      headers.append(
        'Set-Cookie',
        `y_rt=${encodeURIComponent(tokens.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      );
    }

    headers.append('Location', '/settings?yahoo=connected');
    return new NextResponse(null, { status: 302, headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Yahoo callback error';
    return new NextResponse(message, { status: 502 });
  }
}
