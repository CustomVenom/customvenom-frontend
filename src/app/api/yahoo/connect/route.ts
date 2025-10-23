import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

const Y_AUTH = 'https://api.login.yahoo.com/oauth2/request_auth';

export async function GET(req: NextRequest) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  if (!clientId) return NextResponse.json({ error: 'missing_client_id' }, { status: 500 });

  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host')!;
  const site = `${proto}://${host}`;
  const redirectUri = `${site}/api/yahoo/callback`;

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'y_state',
    value: state,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const scope = encodeURIComponent('fspt-r');
  const url = `${Y_AUTH}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${encodeURIComponent(state)}`;
  return NextResponse.redirect(url, { status: 302 });
}
