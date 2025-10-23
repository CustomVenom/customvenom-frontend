import type { NextApiRequest, NextApiResponse } from 'next';

// Minimal fantasy endpoint sample. Depending on your chosen Fantasy API,
// you might need a gameKey or to hit profile first to get the GUID/account key.
// Adjust the URL to the correct Yahoo Fantasy API once you finalize the path.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const at = req.cookies?.y_at;
  if (!at) return res.status(401).json({ ok: false, error: 'not_connected' });

  // Example placeholder. Replace path with the real Yahoo Fantasy leagues list you're targeting.
  const url =
    'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';

  const r = await fetch(url, { headers: { Authorization: `Bearer ${at}` } });
  const body = await r.text();
  if (!r.ok) return res.status(502).send(body);

  res.status(200).send(body);
}
