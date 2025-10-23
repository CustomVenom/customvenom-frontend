import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  if (!clientId) return NextResponse.json({ error: 'missing_client_id' }, { status: 500 });

  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host')!;
  const site = `${proto}://${host}`;
  const redirectUri = `${site}/api/yahoo/callback`;

  const state = crypto.randomUUID();

  const auth = new URL('https://api.login.yahoo.com/oauth2/request_auth');
  auth.searchParams.set('client_id', clientId);
  auth.searchParams.set('redirect_uri', redirectUri);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'fspt-r');
  auth.searchParams.set('state', state);

  const res = NextResponse.redirect(auth.toString(), { status: 302 });
  res.headers.append(
    'Set-Cookie',
    `y_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return res;
}
