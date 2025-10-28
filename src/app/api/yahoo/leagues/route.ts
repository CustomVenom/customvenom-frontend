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
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Yahoo leagues proxy error:', error);
    return NextResponse.json({ error: 'Leagues fetch failed' }, { status: 500 });
  }
}
