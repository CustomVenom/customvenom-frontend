export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const REDIRECT_URI = 'https://www.customvenom.com/api/yahoo/callback';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code') || '';
    const state = url.searchParams.get('state') || '';
    const yState = req.cookies.get('y_state')?.value || '';

    if (!code || !state || !yState || state !== yState) {
      return new NextResponse('Invalid OAuth state', { status: 400 });
    }

    const clientId = process.env.YAHOO_CLIENT_ID;
    const clientSecret = process.env.YAHOO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new NextResponse('Server misconfig: missing YAHOO_CLIENT_ID/SECRET', { status: 500 });
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI, // MUST match the authorize redirect_uri exactly
    });

    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store',
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      // Return Yahoo's actual error for diagnosis
      return new NextResponse(`Token exchange failed: ${r.status}\n${txt}`, { status: 502 });
    }

    const tok = (await r.json()) as {
      access_token: string;
      xoauth_yahoo_guid?: string;
      expires_in?: number;
    };

    if (!tok?.access_token) {
      return new NextResponse('Token exchange returned no access_token', { status: 502 });
    }

    const maxAge = Math.max(60, Math.min(3600, tok.expires_in ?? 900));

    const to = new URL('/settings?yahoo=connected', req.nextUrl.origin);
    const res = NextResponse.redirect(to, { status: 302 });
    res.headers.append(
      'Set-Cookie',
      `y_at=${encodeURIComponent(tok.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
    );

    if (tok.xoauth_yahoo_guid) {
      res.headers.append(
        'Set-Cookie',
        `y_guid=${encodeURIComponent(tok.xoauth_yahoo_guid)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      );
    }

    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unexpected';
    return new NextResponse(`Server error: ${msg}`, { status: 500 });
  }
}
