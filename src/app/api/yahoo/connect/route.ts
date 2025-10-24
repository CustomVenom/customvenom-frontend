export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
// For localhost dev: add http://localhost:3000/api/yahoo/callback to Yahoo app settings
const REDIRECT_URI =
  process.env.YAHOO_REDIRECT_URI || 'https://www.customvenom.com/api/yahoo/callback';

export async function GET(req: NextRequest) {
  const reqId = crypto.randomUUID();
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') ?? '/tools/yahoo';
  const state = crypto.randomUUID();

  console.log(
    JSON.stringify({ level: 'info', req_id: reqId, route: '/api/yahoo/connect', returnTo })
  );

  const auth = new URL(AUTH_URL);
  auth.searchParams.set('client_id', process.env.YAHOO_CLIENT_ID!);
  auth.searchParams.set('redirect_uri', REDIRECT_URI);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'fspt-r');
  auth.searchParams.set('state', state);

  const res = NextResponse.redirect(auth.toString(), { status: 302 });
  // Store state with returnTo info
  const stateWithReturnTo = JSON.stringify({ state, returnTo });
  res.headers.append(
    'Set-Cookie',
    `y_state=${encodeURIComponent(stateWithReturnTo)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return res;
}
