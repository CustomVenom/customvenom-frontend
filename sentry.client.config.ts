import * as Sentry from '@sentry/nextjs';

const DSN = process.env['NEXT_PUBLIC_SENTRY_DSN'] || '';
const VERCEL_ENV = process.env['NEXT_PUBLIC_VERCEL_ENV'] || '';
const NODE_ENV = process.env['NODE_ENV'] || '';

Sentry.init({
  dsn: DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.0, // off by default
  enabled: !!DSN,
  environment: VERCEL_ENV || NODE_ENV,
  
  beforeSend(event, hint) {
    // Add request_id tag if available
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
    
    return event;
  },
});

