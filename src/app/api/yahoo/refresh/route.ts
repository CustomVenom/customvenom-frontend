import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rt = req.cookies.get('y_rt')?.value;
    if (!rt) return NextResponse.json({ ok: false, error: 'no_refresh_token' }, { status: 401 });

    const id = process.env['YAHOO_CLIENT_ID']!;
    const secret = process.env['YAHOO_CLIENT_SECRET']!;
    const basic = Buffer.from(`${id}:${secret}`).toString('base64');

    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host')!;
    const site = `${proto}://${host}`;
    const redirectUri = `${site}/api/yahoo/callback`;

    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: rt,
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
    });

    const text = await resp.text();
    if (!resp.ok) return new NextResponse(text, { status: 502 });

    const json = JSON.parse(text) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    };

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `y_at=${encodeURIComponent(json.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`
    );

    if (json.refresh_token) {
      headers.append(
        'Set-Cookie',
        `y_rt=${encodeURIComponent(json.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      );
    }

    return new NextResponse(null, { status: 204, headers });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'refresh_failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

