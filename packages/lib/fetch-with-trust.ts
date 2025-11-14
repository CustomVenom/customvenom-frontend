import { emitTrustUpdate } from './trust-context';

export type Trust = {
  schemaVersion?: string | null;
  lastRefresh?: string | null;
  requestId?: string | null;
  stale?: string | null;
};

export async function fetchWithTrust(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const trust: Trust = {
    schemaVersion: res.headers.get('x-schema-version'),
    lastRefresh: res.headers.get('x-last-refresh'),
    requestId: res.headers.get('x-request-id'),
    stale: res.headers.get('x-stale'),
  };

  // Emit trust update for public footer (browser-only)
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    emitTrustUpdate({
      schemaVersion: trust.schemaVersion,
      lastRefresh: trust.lastRefresh,
    });
  }

  const data = await res.json();
  return { data, trust } as const;
}
