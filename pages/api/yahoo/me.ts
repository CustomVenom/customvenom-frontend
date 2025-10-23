import type { NextApiRequest, NextApiResponse } from 'next';

// Lightweight test route to confirm token works.
// Yahoo OpenID userinfo is available via the "openid profile email" scopes.
// For Fantasy Sports, you'll use fspt-r endpoints below.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const at = req.cookies?.y_at;
  if (!at) return res.status(401).json({ ok: false, error: 'not_connected' });

  const resp = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
    headers: { Authorization: `Bearer ${at}` },
  });

  const text = await resp.text();
  if (!resp.ok) return res.status(502).send(text);
  return res.status(200).send(text); // pass-through JSON
}
