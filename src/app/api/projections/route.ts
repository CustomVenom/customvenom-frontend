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

    const body = JSON.stringify(data);

    // Start response with upstream status and clone upstream headers wholesale first
    const nextResponse = new NextResponse(body, {
      status: response.status,
      headers: response.headers,
    });

    // Ensure JSON content-type if missing
    if (!nextResponse.headers.has('content-type')) {
      nextResponse.headers.set('content-type', 'application/json');
    }

    // Explicitly set or re-ensure the key headers (case-insensitive on set)
    const rid = response.headers.get('x-request-id');
    if (rid) nextResponse.headers.set('x-request-id', rid);

    const cors =
      response.headers.get('Access-Control-Allow-Origin') ||
      response.headers.get('access-control-allow-origin');
    if (cors) nextResponse.headers.set('Access-Control-Allow-Origin', cors);

    const cc = response.headers.get('cache-control');
    if (cc) nextResponse.headers.set('cache-control', cc);

    // Forward relevant headers from the workers-api response
    const schemaVersion = response.headers.get('x-schema-version') || dataSchemaVersion;
    const lastRefresh = response.headers.get('x-last-refresh') || new Date().toISOString();

    nextResponse.headers.set('x-schema-version', schemaVersion);
    nextResponse.headers.set('x-last-refresh', lastRefresh);

    // Make x-request-id readable by client JS (fetch().headers.get(...))
    const exposed = new Set(
      (nextResponse.headers.get('Access-Control-Expose-Headers') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    exposed.add('x-request-id');
    nextResponse.headers.set('Access-Control-Expose-Headers', Array.from(exposed).join(', '));

    return nextResponse;
  } catch (error) {
    console.error('Error fetching projections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
