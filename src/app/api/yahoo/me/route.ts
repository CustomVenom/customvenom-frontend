import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });

  const guid = req.cookies.get('y_guid')?.value;

  // If we have guid, use it; else call users;me
  const url = guid
    ? `https://fantasysports.yahooapis.com/fantasy/v2/users;guid=${encodeURIComponent(guid)}?format=json`
    : `https://fantasysports.yahooapis.com/fantasy/v2/users;me?format=json`;

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${at}` },
    cache: 'no-store',
  });
  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: 502 });
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'application/json' } });
}
