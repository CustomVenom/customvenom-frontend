// src/lib/test-utils/trust-headers.ts
// Utility for asserting trust headers in API responses

export type TrustHeaders = {
  'x-schema-version': string | null;
  'x-last-refresh': string | null;
  'x-request-id': string | null;
  'x-stale': string | null;
};

export function extractTrustHeaders(response: Response): TrustHeaders {
  return {
    'x-schema-version': response.headers.get('x-schema-version'),
    'x-last-refresh': response.headers.get('x-last-refresh'),
    'x-request-id': response.headers.get('x-request-id'),
    'x-stale': response.headers.get('x-stale'),
  };
}

export function assertTrustHeaders(headers: TrustHeaders, endpoint: string): void {
  const missing: string[] = [];

  if (!headers['x-schema-version']) missing.push('x-schema-version');
  if (!headers['x-last-refresh']) missing.push('x-last-refresh');
  if (!headers['x-request-id']) missing.push('x-request-id');
  // x-stale is optional, but log if missing
  if (!headers['x-stale']) {
    console.warn(`[Trust Headers] ${endpoint} missing optional x-stale header`);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing trust headers on ${endpoint}: ${missing.join(', ')}. Got: ${JSON.stringify(headers)}`,
    );
  }

  // Log requestId for traceability
  console.log(`[Trust Headers] ${endpoint} requestId: ${headers['x-request-id']}`);
}

export async function testApiEndpoint(
  url: string,
  options?: RequestInit,
): Promise<{ ok: boolean; status: number; trustHeaders: TrustHeaders; requestId: string }> {
  const response = await fetch(url, options);
  const trustHeaders = extractTrustHeaders(response);

  // Assert trust headers exist
  assertTrustHeaders(trustHeaders, url);

  return {
    ok: response.ok,
    status: response.status,
    trustHeaders,
    requestId: trustHeaders['x-request-id'] || 'unknown',
  };
}

// Test multiple endpoints
export async function testApiEndpoints(baseUrl: string = '') {
  const endpoints = [
    '/api/projections?week=2025-46&sport=nfl&scoring_format=half_ppr',
    '/api/lineup-optimizer?team_key=test&risk=neutral',
    '/api/league/transactions?league_key=test',
  ];

  const results = await Promise.allSettled(
    endpoints.map((endpoint) => testApiEndpoint(`${baseUrl}${endpoint}`)),
  );

  const failures: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failures.push(`${endpoints[index]}: ${result.reason}`);
    } else if (!result.value.ok) {
      failures.push(`${endpoints[index]}: HTTP ${result.value.status}`);
    }
  });

  if (failures.length > 0) {
    throw new Error(`API endpoint tests failed:\n${failures.join('\n')}`);
  }

  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
