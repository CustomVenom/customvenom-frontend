export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const yState = req.cookies.get('y_state')?.value || '';
  if (!code || !state || !yState || state !== yState) {
    return new NextResponse('Invalid OAuth state', { status: 400 });
  }

  const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
  const basic = Buffer.from(
    `${process.env.YAHOO_CLIENT_ID!}:${process.env.YAHOO_CLIENT_SECRET!}`
  ).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://www.customvenom.com/api/yahoo/callback', // EXACT match
  });

  const r = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    return new NextResponse(`Token exchange failed: ${r.status}\n${t}`, { status: 502 });
  }

  const tok = (await r.json()) as {
    access_token: string;
    xoauth_yahoo_guid?: string;
    expires_in?: number;
  };
  const maxAge = Math.max(60, Math.min(3600, tok.expires_in ?? 900));

  const res = NextResponse.redirect('/settings?yahoo=connected', { status: 302 });
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
}
