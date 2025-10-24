import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || 'https://api.customvenom.com';
  const reqId = crypto.randomUUID();

  try {
    const body = await req.json();

    const r = await fetch(`${apiBase}/api/me/synced-leagues`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': reqId,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!r.ok) {
      const errorText = await r.text();
      return new NextResponse(`Upstream error: ${errorText}`, { status: r.status });
    }

    const result = await r.json();
    return NextResponse.json(result, {
      headers: {
        'cache-control': 'no-store',
        'x-request-id': reqId,
      },
    });
  } catch (error) {
    console.error('[me/synced-leagues]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
