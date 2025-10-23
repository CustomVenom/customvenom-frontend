import { NextRequest, NextResponse } from 'next/server';

// Minimal fantasy endpoint sample. Depending on your chosen Fantasy API,
// you might need a gameKey or to hit profile first to get the GUID/account key.
// Adjust the URL to the correct Yahoo Fantasy API once you finalize the path.

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });

  // Example placeholder. Replace path with the real Yahoo Fantasy leagues list you're targeting.
  const url =
    'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json';

  const r = await fetch(url, { headers: { Authorization: `Bearer ${at}` } });
  const body = await r.text();
  if (!r.ok) return new NextResponse(body, { status: 502 });

  return new NextResponse(body, { status: 200 });
}
