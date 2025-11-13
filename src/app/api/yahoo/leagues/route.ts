import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE not configured' }, { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const queryString = url.search;

    const r = await fetch(`${apiBase}/yahoo/leagues${queryString}`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const body = await r.text();

    // Forward Trust Bundle headers
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'application/json',
        'x-schema-version': r.headers.get('x-schema-version') || 'v1',
        'x-last-refresh': r.headers.get('x-last-refresh') || new Date().toISOString(),
        'x-stale': r.headers.get('x-stale') || 'false',
        'x-request-id': r.headers.get('x-request-id') || 'unavailable',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Yahoo leagues proxy error:', error);
    return NextResponse.json({ error: 'Leagues fetch failed' }, { status: 500 });
  }
}
