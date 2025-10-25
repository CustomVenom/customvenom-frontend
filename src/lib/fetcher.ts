/**
 * Fetcher utilities
 * Unified error handling and header extraction
 */

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  headers: Headers;
  status: number;
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    return {
      data: response.ok ? data : null,
      error: response.ok ? null : data?.error || `HTTP ${response.status}`,
      headers: response.headers,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      headers: new Headers(),
      status: 0,
    };
  }
}

export function getHeader(headers: Headers, name: string): string | null {
  return headers.get(name);
}

export function isStale(headers: Headers): boolean {
  return headers.get('x-stale') === 'true';
}

export function getStaleAge(headers: Headers): string | null {
  return headers.get('x-stale-age');
}

export function getSchemaVersion(headers: Headers): string {
  return headers.get('x-schema-version') || 'v1';
}

export function getLastRefresh(headers: Headers): string | null {
  return headers.get('x-last-refresh');
}
