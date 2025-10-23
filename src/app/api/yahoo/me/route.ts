import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });

  const r = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
    headers: { Authorization: `Bearer ${at}` },
    cache: 'no-store',
  });
  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: 502 });
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'application/json' } });
}
