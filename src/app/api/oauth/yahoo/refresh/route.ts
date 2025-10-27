import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE not configured' }, { status: 500 });
  }

  try {
    const r = await fetch(`${apiBase}/oauth/yahoo/refresh`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('OAuth refresh proxy error:', error);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
