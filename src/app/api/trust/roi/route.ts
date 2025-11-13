import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const season = searchParams.get('season') || '2025';

    if (!userId) {
      return NextResponse.json({ error: 'user_id parameter is required' }, { status: 400 });
    }

    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Fetch from Workers API /api/trust/roi endpoint
    // If endpoint doesn't exist yet, return placeholder data
    try {
      const response = await fetch(`${apiBase}/api/trust/roi?user_id=${userId}&season=${season}`, {
        headers: {
          Accept: 'application/json',
        },
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
    } catch {
      // Endpoint not implemented yet, return placeholder
    }

    // Placeholder response until Trust Foundation is fully implemented
    const placeholder = {
      total_points: 0,
      breakdown: {
        start_sit: 0,
        waiver: 0,
        lineup_opt: 0,
        ignored: 0,
      },
      win_rate: 0,
      decisions_followed: 0,
      decisions_total: 0,
    };

    return NextResponse.json(placeholder, {
      headers: {
        'Content-Type': 'application/json',
        'x-schema-version': 'v1',
        'x-last-refresh': new Date().toISOString(),
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching ROI:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
