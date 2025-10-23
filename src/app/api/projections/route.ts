import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');

    if (!week) {
      return NextResponse.json({ error: 'Week parameter is required' }, { status: 400 });
    }

    // Get the API base URL from environment variables
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE;

    if (!apiBase) {
      return NextResponse.json({ error: 'API base URL not configured' }, { status: 500 });
    }

    // Fetch data from the workers-api
    const response = await fetch(`${apiBase}/projections?week=${week}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch projections: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate schema version (defensive coding)
    const SUPPORTED_SCHEMA_VERSIONS = ['v1'];
    const dataSchemaVersion =
      data.schema_version || response.headers.get('x-schema-version') || 'v1';

    if (!SUPPORTED_SCHEMA_VERSIONS.includes(dataSchemaVersion)) {
      console.warn(
        'Unsupported schema version received:',
        dataSchemaVersion,
        '- proceeding with caution'
      );
      // Still proceed to show data, but log for monitoring
    }

    // Create response with additional headers for trust badge
    const nextResponse = NextResponse.json(data);

    // Forward key headers for observability and CORS
    const fwd = ['x-request-id', 'cache-control', 'Access-Control-Allow-Origin'];
    fwd.forEach((h) => {
      const v = response.headers.get(h);
      if (v) nextResponse.headers.set(h, v);
    });

    // Forward relevant headers from the workers-api response
    const schemaVersion = response.headers.get('x-schema-version') || dataSchemaVersion;
    const lastRefresh = response.headers.get('x-last-refresh') || new Date().toISOString();

    nextResponse.headers.set('x-schema-version', schemaVersion);
    nextResponse.headers.set('x-last-refresh', lastRefresh);

    return nextResponse;
  } catch (error) {
    console.error('Error fetching projections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
