// src/lib/cors.ts
// CORS hardening with configurable origins and HTTPS enforcement

export interface CorsOptions {
  allowedOrigins: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

/**
 * Parse ALLOWED_ORIGINS environment variable
 */
export function parseAllowedOrigins(envValue?: string): string[] {
  if (!envValue) {
    return ['http://localhost:3000']; // Default for development
  }

  return envValue
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => {
      // Enforce HTTPS in production
      if (process.env.NODE_ENV === 'production' && origin.startsWith('http://')) {
        console.warn(`[CORS] Blocking HTTP origin in production: ${origin}`);
        return false;
      }
      return origin.length > 0;
    });
}

/**
 * Create CORS headers
 */
export function createCorsHeaders(
  origin: string | null,
  options: CorsOptions,
): Record<string, string> {
  const {
    allowedOrigins,
    allowCredentials = true,
    maxAge = 86400, // 24 hours
  } = options;

  const headers: Record<string, string> = {
    Vary: 'Origin',
  };

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = allowCredentials.toString();
    headers['Access-Control-Max-Age'] = maxAge.toString();
  } else if (origin) {
    // Origin not allowed - don't set CORS headers
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return headers;
  }

  return headers;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflightRequest(request: Request, options: CorsOptions): Response {
  const origin = request.headers.get('Origin');
  const _method = request.headers.get('Access-Control-Request-Method');
  const headers = request.headers.get('Access-Control-Request-Headers');

  const corsHeaders = createCorsHeaders(origin, options);

  if (!corsHeaders['Access-Control-Allow-Origin']) {
    return new Response('CORS not allowed', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': headers || 'Content-Type, Authorization',
    },
  });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: Response,
  origin: string | null,
  options: CorsOptions,
): Response {
  const corsHeaders = createCorsHeaders(origin, options);

  if (!corsHeaders['Access-Control-Allow-Origin']) {
    return response; // Don't modify response if origin not allowed
  }

  // Clone response and add CORS headers
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Get CORS configuration from environment
 */
export function getCorsConfig(): CorsOptions {
  const allowedOrigins = parseAllowedOrigins(process.env['ALLOWED_ORIGINS']);

  return {
    allowedOrigins,
    allowCredentials: true,
    maxAge: 86400, // 24 hours
  };
}
