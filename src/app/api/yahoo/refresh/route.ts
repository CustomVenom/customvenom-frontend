import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get NextAuth session
    const { auth } = await import('../../../../lib/auth');
    const session = await auth();

    if (!session?.user?.sub) {
      return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 });
    }

    // Call Workers API with session token
    const apiBase = process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const r = await fetch(`${apiBase}/api/yahoo/refresh`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${session.user.sub}`,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: r.status });
    }

    const body = await r.json();
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error('[api/yahoo/refresh]', error);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}

