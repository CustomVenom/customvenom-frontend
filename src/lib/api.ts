/**
 * Simple API client utilities
 * Provides fetchJson helper for API calls
 */

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch JSON from an API endpoint
 * Returns a standardized ApiResponse format
 */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error || `HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      data: data as T,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

