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
export async function fetchLogMetrics(timeWindowMs: number = 86400000): Promise<LogMetrics | null> {
  try {
    // TODO: Wire to actual Cloudflare Workers logs API
    // For now, return mock data to demonstrate live tiles
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if logs are available (this would be a real check in production)
    const logsAvailable = process.env.NEXT_PUBLIC_LOGS_ENABLED === 'true';
    
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
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching log metrics:', error);
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
      total_requests: 0
    };
  }
  
  // Count 5xx errors
  const errors5xx = logs.filter(log => log.status >= 500 && log.status < 600).length;
  
  // Calculate p95 latency
  const latencies = logs.map(log => log.duration_ms).sort((a, b) => a - b);
  const p95Index = Math.floor(latencies.length * 0.95);
  const p95Latency = latencies[p95Index] || 0;
  
  // Calculate cache hit rate (if available)
  const logsWithCacheInfo = logs.filter(log => log.cache_hit !== undefined);
  let cacheHitRate: number | null = null;
  
  if (logsWithCacheInfo.length > 0) {
    const cacheHits = logsWithCacheInfo.filter(log => log.cache_hit === true).length;
    cacheHitRate = (cacheHits / logsWithCacheInfo.length) * 100;
  }
  
  return {
    errors_5xx: errors5xx,
    p95_latency_ms: Math.round(p95Latency),
    cache_hit_rate: cacheHitRate ? Math.round(cacheHitRate) : null,
    total_requests: logs.length
  };
}

/**
 * Fetch logs from Cloudflare Workers
 * This would connect to Cloudflare's Logpush or Analytics API
 */
export async function fetchWorkerLogs(timeWindowMs: number = 86400000): Promise<LogEntry[]> {
  // TODO: Implement actual Cloudflare Workers log fetching
  // Options:
  // 1. Cloudflare GraphQL Analytics API
  // 2. Cloudflare Logpush to R2/S3, then query
  // 3. Custom logging endpoint that aggregates metrics
  
  return [];
}

