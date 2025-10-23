export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });
  const url = 'https://fantasysports.yahooapis.com/fantasy/v2/users;me?format=json';
  const r = await fetch(url, { headers: { Authorization: `Bearer ${at}` }, cache: 'no-store' });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': 'application/json' },
  });
}
