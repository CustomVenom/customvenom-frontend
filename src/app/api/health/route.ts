// src/app/api/health/route.ts
// Health check endpoint that pings Workers API and logs trust headers

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function trustHeaders(overrides: Partial<Record<string, string>> = {}): Headers {
  const headers = new Headers();
  headers.set('x-schema-version', overrides['x-schema-version'] ?? 'v2.1');
  headers.set('x-last-refresh', overrides['x-last-refresh'] ?? new Date().toISOString());
  headers.set('x-request-id', overrides['x-request-id'] ?? `health-${Date.now()}`);
  headers.set('x-stale', overrides['x-stale'] ?? 'false');
  return headers;
}

export async function GET(_request: NextRequest) {
  try {
    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'];

    if (!apiBase) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: 'NEXT_PUBLIC_API_BASE not configured - using mock data',
          workers_api: null,
        },
        {
          status: 200,
          headers: trustHeaders(),
        },
      );
    }
    // Ping Workers API health endpoint (or a lightweight endpoint)
    const healthUrl = `${apiBase}/health`;
    const response = await fetch(healthUrl, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const upstreamTrustHeaders = {
      'x-schema-version': response.headers.get('x-schema-version'),
      'x-last-refresh': response.headers.get('x-last-refresh'),
      'x-request-id': response.headers.get('x-request-id'),
      'x-stale': response.headers.get('x-stale'),
    };

    // Log trust headers for debugging
    console.log('[Health Check] Workers API trust headers:', upstreamTrustHeaders);

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: `Workers API returned ${response.status}`,
          workers_api: {
            reachable: true,
            status: response.status,
            trust_headers: upstreamTrustHeaders,
          },
        },
        {
          status: 200,
          headers: trustHeaders({
            'x-stale': 'true',
            'x-request-id': upstreamTrustHeaders['x-request-id'] || `health-${Date.now()}`,
          }),
        },
      );
    }

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'Workers API is reachable',
        workers_api: {
          reachable: true,
          status: response.status,
          trust_headers: upstreamTrustHeaders,
          data: data,
        },
      },
      {
        status: 200,
        headers: trustHeaders({
          'x-schema-version': upstreamTrustHeaders['x-schema-version'] || undefined,
          'x-last-refresh': upstreamTrustHeaders['x-last-refresh'] || undefined,
          'x-request-id': upstreamTrustHeaders['x-request-id'] || undefined,
          'x-stale': upstreamTrustHeaders['x-stale'] || undefined,
        }),
      },
    );
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
      {
        status: 200,
        headers: trustHeaders({
          'x-stale': 'true',
        }),
      },
    );
  }
}
