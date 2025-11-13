import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Forward to Workers API /api/tracking/decision endpoint
    try {
      const response = await fetch(`${apiBase}/api/tracking/decision`, {
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
            'x-schema-version': response.headers.get('x-schema-version') || 'v1',
            'x-last-refresh': response.headers.get('x-last-refresh') || new Date().toISOString(),
            'cache-control': 'no-store',
          },
        });
      }

      return NextResponse.json(
        { error: `Failed to track decision: ${response.status}` },
        { status: response.status },
      );
    } catch {
      // Endpoint not implemented yet, return success anyway (fail silently)
      return NextResponse.json(
        { success: true },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-schema-version': 'v1',
            'x-last-refresh': new Date().toISOString(),
            'cache-control': 'no-store',
          },
        },
      );
    }
  } catch (error) {
    console.error('Error tracking decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
