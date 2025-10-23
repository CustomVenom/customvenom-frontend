import type { NextApiRequest, NextApiResponse } from 'next';
import { clearCookie } from '../../../lib/cookies';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const basic = Buffer.from(
    `${process.env.YAHOO_CLIENT_ID!}:${process.env.YAHOO_CLIENT_SECRET!}`
  ).toString('base64');

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Yahoo token exchange failed: ${resp.status} ${text}`);
  }
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    xoauth_yahoo_guid?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = req.headers.host!;
    const site = `${proto}://${host}`;
    const redirectUri = `${site}/api/yahoo/callback`;
    const code = String(req.query.code ?? '');
    const state = String(req.query.state ?? '');
    const cookieState = req.cookies?.y_state ?? '';

    // CSRF/state check
    if (!state || !cookieState || state !== cookieState) {
      return res.status(400).send('Invalid OAuth state');
    }
    // one-time use
    clearCookie(res, 'y_state');

    if (!code) {
      return res.status(400).send('Missing code');
    }

    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // DEMO persistence (session cookie). Replace with DB storage per user in production.
    // Store short-lived access token for 15 minutes to complete "me/leagues" test.
    res.setHeader(
      'Set-Cookie',
      [
        `y_at=${encodeURIComponent(tokens.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`,
        tokens.refresh_token
          ? `y_rt=${encodeURIComponent(tokens.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
          : '', // 30 days
      ]
        .filter(Boolean)
        .join(', ')
    );

    // Redirect back to a settings page or success screen
    res.redirect(302, '/settings?yahoo=connected');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Yahoo callback error';
    return res.status(502).send(message);
  }
}
