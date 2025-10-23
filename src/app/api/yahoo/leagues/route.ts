import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });

  // Replace with the concrete Yahoo Fantasy endpoint you target
  const url =
    'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl';
  const r = await fetch(url, { headers: { Authorization: `Bearer ${at}` }, cache: 'no-store' });
  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: 502 });
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'application/json' } });
}
