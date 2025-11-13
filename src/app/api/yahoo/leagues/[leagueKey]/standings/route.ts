import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { leagueKey: string } },
): Promise<NextResponse> {
  const { leagueKey } = params;
  const reqId = crypto.randomUUID();

  try {
    const apiBase =
      process.env['API_BASE'] ||
      process.env['NEXT_PUBLIC_API_BASE'] ||
      'https://api.customvenom.com';
    const cookie = req.headers.get('cookie') || '';
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const r = await fetch(`${apiBase}/yahoo/leagues/${leagueKey}/standings?format=${format}`, {
      headers: {
        'x-request-id': reqId,
        accept: 'application/json',
        cookie: cookie,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, standings: [], error: 'upstream_unavailable' },
        { status: r.status },
      );
    }

    const body = await r.json();

    // Forward Trust Bundle headers
    return NextResponse.json(body, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-request-id': reqId,
        'x-schema-version': r.headers.get('x-schema-version') || body.schema_version || 'v1',
        'x-last-refresh':
          r.headers.get('x-last-refresh') || body.last_refresh || new Date().toISOString(),
        'x-stale': r.headers.get('x-stale') || 'false',
      },
    });
  } catch (error) {
    console.error('[api/yahoo/leagues/standings]', error);
    return NextResponse.json(
      { ok: false, standings: [], error: 'internal_error' },
      { status: 500 },
    );
  }
}
