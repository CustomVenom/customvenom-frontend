export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const PROD_HOST = 'https://www.customvenom.com';

// Yahoo OAuth: MUST use production domain with www
function yahooRedirectUri(): string {
  return `${PROD_HOST}/api/yahoo/callback`;
}

export async function GET(req: NextRequest) {
  const reqId = crypto.randomUUID();
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') ?? '/dashboard';
  const state = crypto.randomUUID();

  console.log(
    JSON.stringify({ level: 'info', req_id: reqId, route: '/api/yahoo/connect', returnTo }),
  );

  // Yahoo OAuth: enforce absolute https://www... redirect
  const redirectUri = yahooRedirectUri();
  if (!redirectUri.startsWith('https://www.customvenom.com/api/yahoo/callback')) {
    return new NextResponse('Invalid redirect URI configuration', { status: 500 });
  }

  const auth = new URL(AUTH_URL);
  auth.searchParams.set('client_id', process.env['YAHOO_CLIENT_ID']!);
  auth.searchParams.set('redirect_uri', redirectUri);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'fspt-r');
  auth.searchParams.set('state', state);

  const res = NextResponse.redirect(auth.toString(), { status: 302 });
  // Store state with returnTo info
  const stateWithReturnTo = JSON.stringify({ state, returnTo });
  // Cookie domain: .customvenom.com for cross-subdomain
  res.headers.append(
    'Set-Cookie',
    `y_state=${encodeURIComponent(stateWithReturnTo)}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.customvenom.com; Max-Age=600`,
  );
  return res;
}
