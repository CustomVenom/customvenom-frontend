/**
 * Unified API client with consistent request ID extraction and error handling
 * Single source of truth for all API calls to prevent "no-request-id" issues
 */

export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  requestId: string;
  status?: number;
};

export async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const base = process.env['NEXT_PUBLIC_API_BASE'] as string;
  const url = `${base}${path}`;

  // Merge headers with defaults
  const headers = new Headers({
    accept: 'application/json',
    ...(init.headers || {}),
  });

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  // Extract request ID from header first
  const headerRequestId = res.headers.get('x-request-id') || 'unavailable';

  // Try to parse response body
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // If JSON parsing fails, body remains null
  }

  // Prefer body.request_id, fallback to header, then unavailable
  const bodyRequestId = body?.request_id || null;
  const requestId = bodyRequestId || headerRequestId || 'unavailable';

  if (!res.ok) {
    const error = body?.error || `http_${res.status}`;
    return {
      ok: false,
      error,
      requestId,
      status: res.status,
    };
  }

  return {
    ok: true,
    data: body as T,
    requestId,
  };
}

/**
 * Helper to extract request ID from API result
 * Never returns "no-request-id" - always returns a valid string
 */
export function getReqId(res: ApiResult<any>): string {
  return res.requestId || 'unavailable';
}

/**
 * Deduplicated Yahoo session probe
 * Prevents multiple parallel calls to /yahoo/me
 */
let inFlight: Promise<ApiResult<any>> | null = null;

export function probeYahooMe(): Promise<ApiResult<any>> {
  if (!inFlight) {
    inFlight = fetchJson('/yahoo/me').finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
