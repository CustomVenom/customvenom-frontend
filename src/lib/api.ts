// Types
export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  requestId: string;
};

// Unified API client with proper base URL and deduplication
export async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const base = process.env['NEXT_PUBLIC_API_BASE']!;
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  const hdrId = res.headers.get('x-request-id') || 'unavailable';
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Ignore JSON parse errors
  }

  const requestId = (body as any)?.request_id || hdrId || 'unavailable';

  return res.ok
    ? { ok: true, data: body as T, requestId }
    : { ok: false, error: (body as any)?.error || `http_${res.status}`, requestId };
}

// Helper to extract request ID from response
export function getReqId(result: ApiResult): string {
  return result.requestId;
}

// Dedup login probe to prevent multiple simultaneous requests
let inFlight: Promise<ApiResult> | null = null;
export function probeYahooMe(): Promise<ApiResult> {
  if (!inFlight) {
    inFlight = fetchJson('/yahoo/me').finally(() => (inFlight = null));
  }
  return inFlight;
}
