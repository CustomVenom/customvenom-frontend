import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  tracesSampleRate: 0.1, // 10% of transactions
  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Add request_id tag if available (from headers or error)
    const requestId = hint.originalException?.['requestId'] || 
                      hint.syntheticException?.['requestId'];
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
      const error = hint.originalException as any;
      if (error.statusCode) {
        event.tags = { ...event.tags, status_code: error.statusCode.toString() };
      }
    }
    
    return event;
  },
});

