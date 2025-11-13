import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Fetch from Workers API /api/trust/snapshot endpoint
    // If endpoint doesn't exist yet, return basic trust data from health endpoint
    const healthResponse = await fetch(`${apiBase}/api/health`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!healthResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch trust snapshot: ${healthResponse.status}` },
        { status: healthResponse.status },
      );
    }

    const healthData = await healthResponse.json();

    // Return trust snapshot format
    const trustSnapshot = {
      schema_version: healthData.schema_version || 'v1',
      last_refresh: healthData.last_refresh || new Date().toISOString(),
      is_stale: false, // Will be determined by x-stale header if available
      accuracy_7d: undefined, // Will be populated when Trust Foundation is fully implemented
      predictions_tracked: undefined,
      in_range_rate: undefined,
    };

    const nextResponse = new NextResponse(JSON.stringify(trustSnapshot), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-schema-version': trustSnapshot.schema_version,
        'x-last-refresh': trustSnapshot.last_refresh,
        'x-stale': 'false',
        'cache-control': 'public, max-age=60',
      },
    });

    return nextResponse;
  } catch (error) {
    console.error('Error fetching trust snapshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
