import * as Sentry from '@sentry/nextjs';

const DSN = process.env['SENTRY_DSN'] || '';
const VERCEL_ENV = process.env['VERCEL_ENV'] || '';
const NODE_ENV = process.env['NODE_ENV'] || '';

Sentry.init({
  dsn: DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  enabled: !!DSN,
  environment: VERCEL_ENV || NODE_ENV,

  beforeSend(event, hint) {
    // Add request_id tag if available (from headers or error)
    const originalEx = hint.originalException as { requestId?: string } | undefined;
    const syntheticEx = hint.syntheticException as { requestId?: string } | undefined;
    const requestId = originalEx?.requestId || syntheticEx?.requestId;
    if (requestId) {
      event.tags = { ...event.tags, request_id: requestId };
    }

    // Add route tag from URL
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        event.tags = { ...event.tags, route: url.pathname };
      } catch {
        // Invalid URL, skip
      }
    }

    // Add custom context from error
    if (hint.originalException) {
      const error = hint.originalException as Error & { statusCode?: number };
      if (error.statusCode) {
        event.tags = { ...event.tags, status_code: error.statusCode.toString() };
      }
    }

    return event;
  },
});

