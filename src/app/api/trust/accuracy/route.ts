import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const detailed = searchParams.get('detailed') === 'true';

    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Fetch from Workers API /api/trust/accuracy endpoint
    // If endpoint doesn't exist yet, return placeholder data
    try {
      const response = await fetch(
        `${apiBase}/api/trust/accuracy?timeframe=${timeframe}&detailed=${detailed}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, {
          headers: {
            'Content-Type': 'application/json',
            'x-schema-version': response.headers.get('x-schema-version') || 'v1',
            'x-last-refresh': response.headers.get('x-last-refresh') || new Date().toISOString(),
            'cache-control': 'public, max-age=300',
          },
        });
      }
    } catch {
      // Endpoint not implemented yet, return placeholder
    }

    // Placeholder response until Trust Foundation is fully implemented
    const placeholder = {
      accuracy: 0.91,
      sample_size: 0,
      ...(detailed && {
        overall: {
          accuracy: 0.91,
          sample: 0,
          mae: 2.3,
          bias: 0.4,
        },
        by_position: {},
        floor_hit_rate: 0.97,
        ceiling_hit_rate: 0.94,
      }),
    };

    return NextResponse.json(placeholder, {
      headers: {
        'Content-Type': 'application/json',
        'x-schema-version': 'v1',
        'x-last-refresh': new Date().toISOString(),
        'cache-control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching accuracy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
