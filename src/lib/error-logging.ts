// src/lib/error-logging.ts
// Structured error logging with requestId tracking

export type ErrorContext = {
  requestId?: string | null;
  endpoint?: string;
  userId?: string;
  [key: string]: unknown;
};

export function logError(error: Error | unknown, context: ErrorContext = {}): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: new Date().toISOString(),
  };

  // Log to console in dev, could be extended to send to logging service
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Logger]', logData);
  } else {
    // In production, you might want to send to Sentry, LogRocket, etc.
    console.error('[Error Logger]', JSON.stringify(logData));
  }
}

export function logTrustHeaders(
  endpoint: string,
  headers: {
    'x-schema-version'?: string | null;
    'x-last-refresh'?: string | null;
    'x-request-id'?: string | null;
    'x-stale'?: string | null;
  },
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Trust Headers] ${endpoint}:`, {
      schemaVersion: headers['x-schema-version'],
      lastRefresh: headers['x-last-refresh'],
      requestId: headers['x-request-id'],
      stale: headers['x-stale'],
    });
  }
}
