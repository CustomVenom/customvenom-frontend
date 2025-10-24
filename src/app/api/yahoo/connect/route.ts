export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const REDIRECT_URI = 'https://www.customvenom.com/api/yahoo/callback'; // canonical

export async function GET() {
  const state = crypto.randomUUID();

  const auth = new URL(AUTH_URL);
  auth.searchParams.set('client_id', process.env.YAHOO_CLIENT_ID!);
  auth.searchParams.set('redirect_uri', REDIRECT_URI);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'fspt-r');
  auth.searchParams.set('state', state);

  const res = NextResponse.redirect(auth.toString(), { status: 302 });
  // Host-wide for safety; SameSite=Lax is correct
  res.headers.append(
    'Set-Cookie',
    `y_state=${encodeURIComponent(state)}; Path=/; Domain=.customvenom.com; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return res;
}
