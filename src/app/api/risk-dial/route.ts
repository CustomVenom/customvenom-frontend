import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '2025-10';
    const sport = searchParams.get('sport') || 'nfl';

    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Build query string for Workers API
    const queryParams = new URLSearchParams();
    queryParams.set('week', week);
    queryParams.set('sport', sport);

    // Fetch from Workers API /risk_dial endpoint
    const response = await fetch(`${apiBase}/risk_dial?${queryParams.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch risk dial: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Forward Trust Bundle headers
    const nextResponse = new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'x-schema-version': response.headers.get('x-schema-version') || data.schema_version || 'v1',
        'x-last-refresh':
          response.headers.get('x-last-refresh') || data.last_refresh || new Date().toISOString(),
        'x-stale': response.headers.get('x-stale') || 'false',
        'x-request-id': response.headers.get('x-request-id') || 'unavailable',
        'cache-control': response.headers.get('cache-control') || 'no-store',
      },
    });

    return nextResponse;
  } catch (error) {
    console.error('Error fetching risk dial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
