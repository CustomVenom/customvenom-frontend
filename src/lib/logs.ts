/**
 * Frontend Logging Adapter
 *
 * Aligns with Workers logger format for cross-cut traceability.
 * All logs (frontend + Workers) must include request_id when available;
 * frontend may generate a temp ID if the backend didn't supply one.
 *
 * Architecture Law #4: Structured JSON Logging with Request IDs
 */

/**
 * Get request_id from headers or generate fallback
 */
function getRequestId(): string {
  if (typeof window === 'undefined') {
    return 'server-' + Date.now();
  }

  // Try to get from headers (if Next.js middleware attached it)
  // For now, generate a temp ID
  // TODO: Wire to Next.js middleware that reads x-request-id from response headers
  return 'client-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

interface LogContext {
  request_id?: string;
  route?: string;
  [key: string]: unknown;
}

interface StructuredLog {
  level: string;
  timestamp: string;
  service: string;
  message: string;
  request_id?: string;
  [key: string]: unknown;
}

/**
 * Create structured log object matching Workers logger format
 */
function createLogObject(level: string, message: string, context?: LogContext): StructuredLog {
  const timestamp = new Date().toISOString();
  const requestId = context?.request_id || getRequestId();

  return {
    level,
    timestamp,
    service: 'frontend',
    message,
    request_id: requestId,
    ...context,
  };
}

/**
 * Log info message
 */
export function info(message: string, context?: LogContext): void {
  const log = createLogObject('info', message, context);
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify(log));
  }
  // Phase 2: Wire to Cloudflare Logpush
}

/**
 * Log warning message
 */
export function warn(message: string, context?: LogContext): void {
  const log = createLogObject('warn', message, context);
  if (process.env.NODE_ENV === 'development') {
    console.warn(JSON.stringify(log));
  }
  // Phase 2: Wire to Cloudflare Logpush
}

/**
 * Log error message
 */
export function error(message: string, error?: Error | unknown, context?: LogContext): void {
  const log = createLogObject('error', message, {
    ...context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  if (process.env.NODE_ENV === 'development') {
    console.error(JSON.stringify(log));
  }
  // Phase 2: Wire to Cloudflare Logpush
}

/**
 * Logs utilities for fetching and parsing operational metrics
 * from Cloudflare Workers logs (when available)
 */

export interface LogMetrics {
  errors_5xx: number;
  p95_latency_ms: number;
  cache_hit_rate: number | null;
  total_requests: number;
  last_updated: string;
}

export interface LogEntry {
  timestamp: string;
  status: number;
  duration_ms: number;
  cache_hit?: boolean;
  route?: string;
  request_id?: string;
}

/**
 * Fetch operational metrics from logs API
 * Returns null when logs are not yet available
 */
export async function fetchLogMetrics(timeWindowMs = 86400000): Promise<LogMetrics | null> {
  try {
    // TODO: Wire to actual Cloudflare Workers logs API
    // Query logs within the specified time window
    info(`Fetching logs for last ${timeWindowMs}ms`, { route: 'logs/metrics' });
    // For now, return mock data to demonstrate live tiles

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if logs are available (this would be a real check in production)
    const logsAvailable = process.env['NEXT_PUBLIC_LOGS_ENABLED'] === 'true';

    if (!logsAvailable) {
      // Return null to indicate logs aren't available yet
      return null;
    }

    // Mock data - replace with actual log aggregation
    return {
      errors_5xx: Math.floor(Math.random() * 10), // Random 0-9
      p95_latency_ms: 200 + Math.floor(Math.random() * 100), // Random 200-300
      cache_hit_rate: null, // Not yet tracked
      total_requests: 1250,
      last_updated: new Date().toISOString(),
    };
  } catch (err) {
    error('Error fetching log metrics', err, { route: 'logs/metrics' });
    return null;
  }
}

/**
 * Parse raw log entries to extract metrics
 */
export function parseLogMetrics(logs: LogEntry[]): Omit<LogMetrics, 'last_updated'> {
  if (logs.length === 0) {
    return {
      errors_5xx: 0,
      p95_latency_ms: 0,
      cache_hit_rate: null,
      total_requests: 0,
    };
  }

  // Count 5xx errors
  const errors5xx = logs.filter((log) => log.status >= 500 && log.status < 600).length;

  // Calculate p95 latency
  const latencies = logs.map((log) => log.duration_ms).sort((a, b) => a - b);
  // eslint-disable-next-line no-restricted-syntax -- Calculating percentile index for operational metrics, not fantasy points
  const p95Index = Math.floor(latencies.length * 0.95);
  const p95Latency = latencies[p95Index] || 0;

  // Calculate cache hit rate (if available)
  const logsWithCacheInfo = logs.filter((log) => log.cache_hit !== undefined);
  let cacheHitRate: number | null = null;

  if (logsWithCacheInfo.length > 0) {
    const cacheHits = logsWithCacheInfo.filter((log) => log.cache_hit === true).length;
    cacheHitRate = (cacheHits / logsWithCacheInfo.length) * 100;
  }

  return {
    errors_5xx: errors5xx,
    p95_latency_ms: Math.round(p95Latency),
    cache_hit_rate: cacheHitRate ? Math.round(cacheHitRate) : null,
    total_requests: logs.length,
  };
}

/**
 * Fetch logs from Cloudflare Workers
 * This would connect to Cloudflare's Logpush or Analytics API
 */
export async function fetchWorkerLogs(timeWindowMs = 86400000): Promise<LogEntry[]> {
  // TODO: Implement actual Cloudflare Workers log fetching
  // Options:
  // 1. Cloudflare GraphQL Analytics API (query last timeWindowMs)
  // 2. Cloudflare Logpush to R2/S3, then query
  // 3. Custom logging endpoint that aggregates metrics
  info(`Fetching worker logs for last ${timeWindowMs}ms`, { route: 'logs/fetch' });

  return [];
}
