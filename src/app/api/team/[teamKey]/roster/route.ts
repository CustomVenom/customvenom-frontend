import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: unknown): Promise<Response> {
  const { teamKey } = (ctx as { params: { teamKey: string } }).params;
  const reqId = crypto.randomUUID();

  try {
    // Workers-only: forward the browser cookie to API (no NextAuth)
    const apiBase =
      process.env['API_BASE'] ||
      process.env['NEXT_PUBLIC_API_BASE'] ||
      'https://api.customvenom.com';
    const cookie = req.headers.get('cookie') || '';
    const r = await fetch(`${apiBase}/api/yahoo/team/${teamKey}/roster`, {
      headers: {
        'x-request-id': reqId,
        accept: 'application/json',
        // Forward Yahoo cookie to API for auth
        cookie: cookie,
      },
      // Do not cache auth-protected data at the edge
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json(
        { connected: false, players: [], error: 'upstream_unavailable' },
        { status: r.status },
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
      { status: 500 },
    );
  }
}
