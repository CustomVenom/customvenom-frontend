/**
 * Trust utilities
 * Helper functions for trust headers and validation
 */

export interface TrustHeaders {
  schemaVersion: string;
  lastRefresh: string | null;
  stale: boolean;
  staleAge: string | null;
}

export function extractTrustHeaders(headers: Headers): TrustHeaders {
  return {
    schemaVersion: headers.get('x-schema-version') || 'v1',
    lastRefresh: headers.get('x-last-refresh'),
    stale: headers.get('x-stale') === 'true',
    staleAge: headers.get('x-stale-age'),
  };
}

export function isValidSchema(version: string): boolean {
  // Basic validation: v{major}.{minor}.{patch}
  return /^v\d+\.\d+\.\d+$/.test(version);
}

export function isDataStale(lastRefresh: string | null, maxAgeSeconds: number = 3600): boolean {
  if (!lastRefresh) return true;

  const refreshTime = new Date(lastRefresh).getTime();
  const now = Date.now();
  const ageSeconds = (now - refreshTime) / 1000;

  return ageSeconds > maxAgeSeconds;
}
