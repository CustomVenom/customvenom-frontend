/**
 * Extract request ID from API response
 * Prioritizes body.request_id, falls back to x-request-id header, then to fallback string
 */
export function extractRequestId(
  response: Response,
  body?: unknown,
  fallback: string = 'unavailable',
): string {
  // Try body.request_id first (most reliable)
  const bodyWithRequestId = body as { request_id?: string };
  if (bodyWithRequestId?.request_id && typeof bodyWithRequestId.request_id === 'string') {
    return bodyWithRequestId.request_id;
  }

  // Fall back to x-request-id header
  const headerRequestId = response.headers.get('x-request-id');
  if (headerRequestId && headerRequestId.trim()) {
    return headerRequestId.trim();
  }

  // Final fallback
  return fallback;
}

/**
 * Extract request ID from response with JSON parsing
 * Handles the common pattern of parsing JSON response and extracting request ID
 */
export async function extractRequestIdFromResponse(
  response: Response,
  fallback: string = 'unavailable',
): Promise<string> {
  let body: unknown = {};

  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    }
  } catch {
    // If JSON parsing fails, body remains empty object
  }

  return extractRequestId(response, body, fallback);
}
