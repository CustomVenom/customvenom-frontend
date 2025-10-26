import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Workers-only: forward the browser cookie to API (no NextAuth)
    const apiBase = process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const cookie = req.headers.get('cookie') || '';
    const r = await fetch(`${apiBase}/api/yahoo/leagues`, {
      headers: {
        'accept': 'application/json',
        // Forward Yahoo cookie to API for auth
        'cookie': cookie,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: r.status });
    }

    const body = await r.json();
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error('[api/yahoo/leagues]', error);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}
