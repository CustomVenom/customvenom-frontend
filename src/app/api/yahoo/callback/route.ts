import { NextRequest, NextResponse } from 'next/server';
// Inline cookie helper to avoid import issues

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const basic = Buffer.from(
    `${process.env.YAHOO_CLIENT_ID!}:${process.env.YAHOO_CLIENT_SECRET!}`
  ).toString('base64');

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
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Yahoo token exchange failed: ${resp.status} ${text}`);
  }
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    xoauth_yahoo_guid?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host')!;
    const site = `${proto}://${host}`;
    const redirectUri = `${site}/api/yahoo/callback`;
    const code = req.nextUrl.searchParams.get('code') || '';
    const state = req.nextUrl.searchParams.get('state') || '';
    const cookieState = req.cookies.get('y_state')?.value || '';

    // CSRF/state check
    if (!state || !cookieState || state !== cookieState) {
      return new NextResponse('Invalid OAuth state', { status: 400 });
    }
    // one-time use
    const response = NextResponse.redirect('/settings?yahoo=connected');
    response.cookies.delete('y_state');

    if (!code) {
      return new NextResponse('Missing code', { status: 400 });
    }

    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // DEMO persistence (session cookie). Replace with DB storage per user in production.
    // Store short-lived access token for 15 minutes to complete "me/leagues" test.
    const accessTokenCookie = `y_at=${encodeURIComponent(tokens.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`;
    const refreshTokenCookie = tokens.refresh_token
      ? `y_rt=${encodeURIComponent(tokens.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      : '';

    response.headers.set(
      'Set-Cookie',
      [accessTokenCookie, refreshTokenCookie].filter(Boolean).join(', ')
    );

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Yahoo callback error';
    return new NextResponse(message, { status: 502 });
  }
}
