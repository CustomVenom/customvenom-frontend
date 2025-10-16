// API Client with request_id logging
// Wraps fetch to log errors with request_id for debugging

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  request_id?: string;
}

interface FetchOptions extends RequestInit {
  logErrors?: boolean;
}

export async function apiFetch<T = unknown>(
  url: string, 
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { logErrors = true, ...fetchOptions } = options;
  
  try {
    const response = await fetch(url, fetchOptions);
    const requestId = response.headers.get('x-request-id');
    
    // Log all API calls with status
    if (typeof window !== 'undefined' && console.log) {
      console.log(JSON.stringify({
        type: 'api_call',
        url,
        status: response.status,
        request_id: requestId,
        timestamp: new Date().toISOString()
      }));
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (logErrors && typeof window !== 'undefined') {
        console.error(JSON.stringify({
          type: 'api_error',
          url,
          status: response.status,
          request_id: requestId || errorData.request_id,
          error: errorData.error || response.statusText,
          timestamp: new Date().toISOString()
        }));
      }
      
      return {
        ok: false,
        error: errorData.error || `HTTP ${response.status}`,
        request_id: requestId || errorData.request_id
      };
    }
    
    const data = await response.json();
    return {
      ok: true,
      data: data as T,
      request_id: requestId || undefined
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    if (logErrors && typeof window !== 'undefined') {
      console.error(JSON.stringify({
        type: 'api_network_error',
        url,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }));
    }
    
    return {
      ok: false,
      error: errorMessage
    };
  }
}

// Helper to extract request_id from response or error
export function getRequestId(response: Response | ApiResponse | Error): string | undefined {
  if (response instanceof Response) {
    return response.headers.get('x-request-id') || undefined;
  }
  if ('request_id' in response) {
    return response.request_id;
  }
  if (response instanceof Error && response.message.includes('request_id')) {
    const match = response.message.match(/request_id[:\s]+([a-f0-9-]+)/i);
    return match ? match[1] : undefined;
  }
  return undefined;
}

