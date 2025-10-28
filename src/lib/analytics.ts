// src/lib/analytics.ts
export type AnalyticsEvent = {
  id: string;
  event_type: string;
  tool_name?: string;
  session_id: string;
  user_id?: string;
  action?: string;
  demo_mode?: boolean;
  timestamp: string;
  properties?: Record<string, unknown>;
};

const devLog = (name: string, props?: Record<string, unknown>) => {
  if (process.env['NODE_ENV'] !== 'production') {
    console.log(`[analytics] ${name}`, props || {});
  }
};

export function trackEvent(name: string, props?: Record<string, unknown>) {
  devLog(name, props);
}
export function trackToolUsage(tool: string, props?: Record<string, unknown>) {
  devLog(`tool:${tool}`, props);
}
export function trackRiskModeChange(mode: 'protect' | 'neutral' | 'chase') {
  devLog('riskMode', { mode });
}
export function trackFeatureInteraction(
  feature: string,
  action: string,
  props?: Record<string, unknown>,
) {
  devLog(`feature:${feature}`, { action, ...(props || {}) });
}

// Read‑only stubs for Ops pages (don't block prod)
export function getEventsSince(_iso: string): AnalyticsEvent[] {
  return [];
}
export function getEventCountsByType(_events: AnalyticsEvent[] = []): Record<string, number> {
  return {};
}
export function getToolUsageStats(_events: AnalyticsEvent[] = []): {
  by_tool: Record<string, number>;
  total: number;
} {
  return { by_tool: {}, total: 0 };
}
export function getRiskModeDistribution(_events: AnalyticsEvent[] = []): Record<string, number> {
  return { protect: 0, neutral: 0, chase: 0 };
}
