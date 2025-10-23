import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

export async function GET(req: NextRequest) {
  try {
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host')!;
    const site = `${proto}://${host}`;
    const redirectUri = `${site}/api/yahoo/callback`;

    const code = req.nextUrl.searchParams.get('code') || '';
    const state = req.nextUrl.searchParams.get('state') || '';
    const jar = await cookies();
    const cookieState = jar.get('y_state')?.value || '';
    if (!state || !cookieState || state !== cookieState)
      return new NextResponse('Invalid OAuth state', { status: 400 });
    jar.set({ name: 'y_state', value: '', path: '/', maxAge: 0 });
    if (!code) return new NextResponse('Missing code', { status: 400 });

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
      cache: 'no-store',
    });
    const text = await resp.text();
    if (!resp.ok) return new NextResponse(`token_exchange_${resp.status}:${text}`, { status: 502 });
    const tokens = JSON.parse(text) as { access_token: string; refresh_token?: string };

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `y_at=${encodeURIComponent(tokens.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`
    );
    if (tokens.refresh_token)
      headers.append(
        'Set-Cookie',
        `y_rt=${encodeURIComponent(tokens.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      );
    headers.append('Location', '/settings?yahoo=connected');
    return new NextResponse(null, { status: 302, headers });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Yahoo callback error';
    return new NextResponse(message, { status: 502 });
  }
}
