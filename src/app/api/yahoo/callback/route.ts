export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const PROD_HOST = 'https://www.customvenom.com';

// Yahoo OAuth: MUST use production domain with www
function yahooRedirectUri(): string {
  return `${PROD_HOST}/api/yahoo/callback`;
}

export async function GET(req: NextRequest) {
  const reqId = crypto.randomUUID();
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code') || '';
    const state = url.searchParams.get('state') || '';
    const yStateCookie = req.cookies.get('y_state')?.value || '';

    console.log(
      JSON.stringify({
        level: 'info',
        req_id: reqId,
        route: '/api/yahoo/callback',
        code_present: !!code,
        state_present: !!state,
      }),
    );

    // Parse state cookie to extract returnTo
    // Always redirect to /tools/leagues as the canonical landing page after OAuth
    let returnTo = '/tools/leagues';
    try {
      const stateData = JSON.parse(decodeURIComponent(yStateCookie));
      if (stateData.state && stateData.returnTo) {
        // Validate returnTo to prevent open redirects
        const parsedReturnTo = stateData.returnTo;

        // Guardrail: reject absolute URLs (only allow internal paths)
        if (parsedReturnTo.startsWith('http://') || parsedReturnTo.startsWith('https://')) {
          console.error('Rejected absolute URL in returnTo:', parsedReturnTo);
          returnTo = '/tools/leagues'; // Safe fallback
        }
        // Only allow redirects to /tools/* pages, prefer /tools/leagues
        else if (parsedReturnTo.startsWith('/tools/leagues')) {
          returnTo = parsedReturnTo;
        } else if (parsedReturnTo.startsWith('/tools/')) {
          // Legacy support: redirect old /tools/yahoo to /tools/leagues
          returnTo = '/tools/leagues';
        }
        // Never redirect to /settings - settings is not a valid OAuth callback destination
      }
    } catch {
      // Fallback to default if parsing fails
    }

    if (!code || !state || !yStateCookie) {
      return new NextResponse('Invalid OAuth state', { status: 400 });
    }

    const clientId = process.env['YAHOO_CLIENT_ID'];
    const clientSecret = process.env['YAHOO_CLIENT_SECRET'];

    if (!clientId || !clientSecret) {
      return new NextResponse('Server misconfig: missing YAHOO_CLIENT_ID/SECRET', { status: 500 });
    }

    // Yahoo OAuth: enforce absolute https://www... redirect
    const redirectUri = yahooRedirectUri();
    if (!redirectUri.startsWith('https://www.customvenom.com/api/yahoo/callback')) {
      return new NextResponse('Invalid redirect URI configuration', { status: 500 });
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri, // MUST match the authorize redirect_uri exactly
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

    const to = new URL(returnTo, req.nextUrl.origin);
    const res = NextResponse.redirect(to, { status: 302 });
    // Cookie domain: .customvenom.com for cross-subdomain, Secure for HTTPS only
    res.headers.append(
      'Set-Cookie',
      `y_at=${encodeURIComponent(tok.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.customvenom.com; Max-Age=${maxAge}`,
    );

    if (tok.xoauth_yahoo_guid) {
      res.headers.append(
        'Set-Cookie',
        `y_guid=${encodeURIComponent(tok.xoauth_yahoo_guid)}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.customvenom.com; Max-Age=2592000`,
      );
    }

    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unexpected';
    return new NextResponse(`Server error: ${msg}`, { status: 500 });
  }
}
