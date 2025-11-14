import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      // If no API base, return success anyway (don't block UX)
      return NextResponse.json({ ok: true, logged: false, error: 'API base not configured' });
    }

    // Forward to Workers API /api/decisions/bubble endpoint
    try {
      const response = await fetch(`${apiBase}/api/decisions/bubble`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, {
          headers: {
            'Content-Type': 'application/json',
            'cache-control': 'no-store',
          },
        });
      }

      // Even if API fails, return success (don't block UX)
      return NextResponse.json({ ok: true, logged: false, error: 'API request failed' });
    } catch {
      // Endpoint error, return success anyway (fail silently, don't block UX)
      return NextResponse.json(
        { ok: true, logged: false },
        {
          headers: {
            'Content-Type': 'application/json',
            'cache-control': 'no-store',
          },
        },
      );
    }
  } catch {
    // Parse error, return success anyway (don't block UX)
    return NextResponse.json({ ok: true, logged: false, error: 'Invalid request' });
  }
}
