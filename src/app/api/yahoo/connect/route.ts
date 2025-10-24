export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const state = crypto.randomUUID();

  const auth = new URL('https://api.login.yahoo.com/oauth2/request_auth');
  auth.searchParams.set('client_id', process.env.YAHOO_CLIENT_ID!);
  auth.searchParams.set('redirect_uri', 'https://www.customvenom.com/api/yahoo/callback');
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'fspt-r');
  auth.searchParams.set('state', state);

  const res = NextResponse.redirect(auth.toString(), { status: 302 });
  // Host-wide cookie so a stray apex request can still recover; safe with middleware 308
  res.headers.append(
    'Set-Cookie',
    `y_state=${encodeURIComponent(state)}; Path=/; Domain=.customvenom.com; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return res;
}
