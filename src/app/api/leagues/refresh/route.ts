import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiBase =
    process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
  const reqId = crypto.randomUUID();

  try {
    const r = await fetch(`${apiBase}/api/me/leagues/refresh`, {
      method: 'POST',
      headers: {
        'x-request-id': reqId,
        'accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json(
        { queued: false, error: 'upstream_error' },
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

    const body = await r.json();
    return NextResponse.json(body, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-request-id': reqId,
      },
    });
  } catch (error) {
    console.error('[api/leagues/refresh]', error);
    return NextResponse.json(
      { queued: false, error: 'internal_error' },
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

