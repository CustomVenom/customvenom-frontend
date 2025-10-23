import { NextRequest, NextResponse } from 'next/server';

// Lightweight test route to confirm token works.
// Yahoo OpenID userinfo is available via the "openid profile email" scopes.
// For Fantasy Sports, you'll use fspt-r endpoints below.

export async function GET(req: NextRequest) {
  const at = req.cookies.get('y_at')?.value;
  if (!at) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 401 });

  const resp = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
    headers: { Authorization: `Bearer ${at}` },
  });

  const text = await resp.text();
  if (!resp.ok) return new NextResponse(text, { status: 502 });
  return new NextResponse(text, { status: 200 }); // pass-through JSON
}
