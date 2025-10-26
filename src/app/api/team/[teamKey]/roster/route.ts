import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { teamKey: string } }) {
  const reqId = crypto.randomUUID();

  try {
    // Get NextAuth session
    const { auth } = await import('../../../../../lib/auth');
    const session = await auth();

    if (!session?.user?.sub) {
      return NextResponse.json(
        { connected: false, players: [], error: 'not_authenticated' },
        { status: 401 }
      );
    }

    // Call Workers API with session token
    const apiBase = process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const r = await fetch(`${apiBase}/api/yahoo/team/${params.teamKey}/roster`, {
      headers: {
        'x-request-id': reqId,
        'accept': 'application/json',
        'authorization': `Bearer ${session.user.sub}`,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json(
        { connected: false, players: [], error: 'upstream_unavailable' },
        { status: r.status }
      );
    }

    const body = await r.json();
    return NextResponse.json(body, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-request-id': reqId,
      },
    });
  } catch (error) {
    console.error('[api/team/roster]', error);
    return NextResponse.json(
      { connected: false, players: [], error: 'internal_error' },
      { status: 500 }
    );
  }
}
