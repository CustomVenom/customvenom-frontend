import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiBase =
    process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
  const reqId = crypto.randomUUID();

  try {
    const r = await fetch(`${apiBase}/api/me/leagues`, {
      headers: {
        'x-request-id': reqId,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      return new NextResponse(`Upstream error: ${r.status}`, { status: r.status });
    }

    const body = await r.json();
    return NextResponse.json(body, {
      headers: {
        'cache-control': 'no-store',
        'x-request-id': reqId,
      },
    });
  } catch (error) {
    console.error('[me/leagues]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
