import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { setCookie } from '../../../lib/cookies';

const Y_AUTH = 'https://api.login.yahoo.com/oauth2/request_auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host!;
  const site = `${proto}://${host}`; // <-- single source of truth
  const redirectUri = `${site}/api/yahoo/callback`;
  const state = randomUUID();

  // Persist CSRF state for 10 minutes
  setCookie(res, 'y_state', state, { maxAge: 600 });

  const scope = encodeURIComponent('openid profile email fspt-r');
  const authUrl =
    `${Y_AUTH}?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=${scope}&state=${encodeURIComponent(state)}`;

  res.redirect(302, authUrl);
}
