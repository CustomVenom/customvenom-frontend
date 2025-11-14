// src/app/api/health/route.ts
// Health check endpoint that pings Workers API and logs trust headers

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

  if (!apiBase) {
    return NextResponse.json(
      {
        status: 'degraded',
        message: 'NEXT_PUBLIC_API_BASE not configured - using mock data',
        workers_api: null,
      },
      { status: 200 },
    );
  }

  try {
    // Ping Workers API health endpoint (or a lightweight endpoint)
    const healthUrl = `${apiBase}/health`;
    const response = await fetch(healthUrl, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const trustHeaders = {
      'x-schema-version': response.headers.get('x-schema-version'),
      'x-last-refresh': response.headers.get('x-last-refresh'),
      'x-request-id': response.headers.get('x-request-id'),
      'x-stale': response.headers.get('x-stale'),
    };

    // Log trust headers for debugging
    console.log('[Health Check] Workers API trust headers:', trustHeaders);

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: `Workers API returned ${response.status}`,
          workers_api: {
            reachable: true,
            status: response.status,
            trust_headers: trustHeaders,
          },
        },
        { status: 200 },
      );
    }

    const data = await response.json().catch(() => ({}));

    return NextResponse.json({
      status: 'healthy',
      message: 'Workers API is reachable',
      workers_api: {
        reachable: true,
        status: response.status,
        trust_headers: trustHeaders,
        data: data,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Health Check] Workers API unreachable:', errorMessage);

    return NextResponse.json(
      {
        status: 'degraded',
        message: `Workers API unreachable: ${errorMessage}`,
        workers_api: {
          reachable: false,
          error: errorMessage,
        },
      },
      { status: 200 },
    );
  }
}
