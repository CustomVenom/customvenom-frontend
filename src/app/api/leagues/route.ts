import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiBase =
    process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
  const reqId = crypto.randomUUID();

  try {
    const r = await fetch(`${apiBase}/yahoo/leagues?season=2025`, {
      headers: {
        'x-request-id': reqId,
        'accept': 'application/json',
        'cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!r.ok) {
      // Return JSON error response
      return NextResponse.json(
        { connected: false, leagues: [], error: 'upstream_unavailable' },
        {
          status: r.status,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
            'x-request-id': reqId,
          },
        }
      );
    }

    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Upstream returned non-JSON, return safe fallback
      return NextResponse.json(
        { connected: false, leagues: [], error: 'invalid_response' },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
            'x-request-id': reqId,
          },
        }
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
    console.error('[api/leagues]', error);
    // Return JSON error response
    return NextResponse.json(
      { connected: false, leagues: [], error: 'internal_error' },
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'x-request-id': reqId,
        },
      }
    );
  }
}

