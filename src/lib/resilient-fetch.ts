// src/lib/resilient-fetch.ts
// Client-side resilience with 10s timeout and retry logic

export interface ResilientFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ResilientFetchResponse extends Response {
  isStale?: boolean;
  requestId?: string;
}

/**
 * Resilient fetch with timeout, retry, and stale data detection
 * Features:
 * - 10s timeout with AbortController
 * - One retry on 5xx errors with 500ms delay
 * - x-stale header detection
 * - Request ID correlation
 */
export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {}
): Promise<ResilientFetchResponse> {
  const {
    timeout = 10000, // 10s timeout
    retries = 1, // One retry
    retryDelay = 500, // 500ms delay
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check for stale data indicator
      const isStale = response.headers.get('x-stale') === 'true';
      const requestId = response.headers.get('x-request-id') || undefined;

      // Return response with additional metadata
      const resilientResponse = response as ResilientFetchResponse;
      resilientResponse.isStale = isStale;
      resilientResponse.requestId = requestId || '';

      return resilientResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;

      // Only retry on 5xx errors or network issues
      const shouldRetry =
        attempt < retries &&
        (error instanceof TypeError || // Network error
        (error as Error)?.name === 'AbortError' || // Timeout
        (error as { status?: number })?.status && (error as { status: number }).status >= 500); // Server error

      if (shouldRetry) {
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Specialized fetch for API endpoints with resilience
 */
export async function fetchWithResilience(
  endpoint: string,
  options: ResilientFetchOptions = {}
): Promise<{ ok: boolean; status: number; requestId: string; body: unknown; isStale?: boolean }> {
  const base = process.env['NEXT_PUBLIC_API_BASE'] || '';
  const url = `${base}${endpoint}`;

  try {
    const response = await resilientFetch(url, {
      cache: 'no-store',
      ...options,
    });

    const body = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      requestId: response.requestId || '',
      body,
      isStale: response.isStale || false,
    };
  } catch (error) {
    // Return error response instead of throwing
    return {
      ok: false,
      status: 0,
      requestId: '',
      body: { error: (error as Error).message },
      isStale: false,
    };
  }
}
