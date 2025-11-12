export type Coverage = Record<string, number>;

export type Pinball = Record<string, number>;

export interface ChipsSummary {
  speak: number;
  suppress: number;
}

export interface OpsData {
  cache: { hits: number; total: number; rate: number };
  coverage: Coverage;
  pinball: Pinball;
  chips: ChipsSummary;
}

export interface CachedProjections {
  data: unknown;
  timestamp: number;
  week: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  tool_name?: string;
  session_id: string;
  user_id?: string;
  action?: string;
  demo_mode?: boolean;
  timestamp: string;
  properties?: Record<string, unknown>;
}

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

export interface TrustHeaders {
  schemaVersion: string;
  lastRefresh: string | null;
  stale: boolean;
  staleAge: string | null;
}

export interface SchemaSentryEnv {
  CURRENT_SCHEMA_VERSION: string;
  LAST_REFRESH: string;
  SCHEMA_OVERRIDE?: string;
}

export interface CorsConfig {
  allowed: string[];
  allowCredentials?: boolean;
  defaultOrigin?: string;
}

export interface CorsResult {
  allowed: boolean;
  origin: string;
  headers: Record<string, string>;
}

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
}

export interface SentryEvent {
  message?: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  request?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
  };
}
