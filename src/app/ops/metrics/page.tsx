'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import {
  getEventsSince,
  getEventCountsByType,
  getToolUsageStats,
  getRiskModeDistribution,
} from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics';
import { getCacheStats } from '@/lib/cache';
import { type Entitlements } from '@/lib/entitlements';

interface MetricsData {
  totalEvents: number;
  eventsByType: Record<string, number>;
  toolUsage: {
    total: number;
    by_tool: Record<string, number>;
  };
  riskDistribution: Record<string, number>;
  recentEvents: AnalyticsEvent[];
  cacheStats: ReturnType<typeof getCacheStats>;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(true);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);

  useEffect(() => {
    // Check access permissions
    const checkAccess = async () => {
      const response = await fetch('/api/entitlements');
      const ents = response.ok ? await response.json() : { isAdmin: false };
      setEntitlements(ents);
    };
    checkAccess();
  }, []);

  const loadMetrics = useCallback(() => {
    setIsLoading(true);

    try {
      const events = getEventsSince(timeRange.toString());

      const data: MetricsData = {
        totalEvents: events.length,
        eventsByType: getEventCountsByType(events),
        toolUsage: getToolUsageStats(events),
        riskDistribution: getRiskModeDistribution(events),
        recentEvents: events.slice(-10).reverse(), // Last 10 events
        cacheStats: getCacheStats(),
      };

      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Access check - Pro or Admin required
  if (entitlements && !entitlements.features.analytics) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Analytics Metrics</h1>

        <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔒</span>
            <h2 className="text-xl font-semibold">
              {entitlements.isFree ? 'Pro Feature' : 'Access Restricted'}
            </h2>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {entitlements.isFree
              ? 'Analytics metrics are available to Pro subscribers and above.'
              : 'You do not have permission to access this feature.'}
          </p>

          <div className="flex gap-3">
            {entitlements.isFree && (
              <Link href="/go-pro" className="cv-btn-primary">
                Upgrade to Pro
              </Link>
            )}
            <Link href="/ops" className="cv-btn-ghost">
              Back to Ops
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Metrics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last {timeRange} hours · Updates on refresh
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm"
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
          </select>

          <button onClick={loadMetrics} className="cv-btn-ghost" disabled={isLoading}>
            {isLoading ? '...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {isLoading && !metrics ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse text-4xl mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Cache Performance Tile */}
          {metrics.cacheStats && (
            <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-6 bg-linear-to-br from-brand-primary/5 to-brand-accent/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>⚡</span>
                Cache Performance
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</div>
                  <div className="text-sm font-semibold">
                    {metrics.cacheStats.exists ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          metrics.cacheStats.status === 'fresh'
                            ? 'text-green-600'
                            : metrics.cacheStats.status === 'stale'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {metrics.cacheStats.status === 'fresh' && '🟢 Fresh'}
                        {metrics.cacheStats.status === 'stale' && '🟡 Stale'}
                        {metrics.cacheStats.status === 'expired' && '🔴 Expired'}
                      </span>
                    ) : (
                      <span className="text-gray-500">⚪ None</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cache Age</div>
                  <div className="text-sm font-semibold">
                    {metrics.cacheStats.exists ? `${metrics.cacheStats.age_minutes} min` : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Size</div>
                  <div className="text-sm font-semibold">
                    {metrics.cacheStats.exists ? `${metrics.cacheStats.size_kb} KB` : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Week</div>
                  <div className="text-sm font-semibold">
                    {metrics.cacheStats.exists ? metrics.cacheStats.week : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hit Rate</div>
                  <div className="text-sm font-semibold">
                    {(() => {
                      const hits = metrics.eventsByType['cache_hit'] || 0;
                      const misses = metrics.eventsByType['cache_miss'] || 0;
                      const total = hits + misses;
                      if (total === 0) return 'N/A';
                      const rate = ((hits / total) * 100).toFixed(1);
                      return (
                        <span className={rate >= '80' ? 'text-green-600' : 'text-yellow-600'}>
                          {rate}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</div>
              <div className="text-3xl font-bold">{metrics.totalEvents}</div>
            </div>

            <div className="rounded-lg p-4 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tool Uses</div>
              <div className="text-3xl font-bold">{metrics.toolUsage.total}</div>
            </div>

            <div className="rounded-lg p-4 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Event Types</div>
              <div className="text-3xl font-bold">{Object.keys(metrics.eventsByType).length}</div>
            </div>
          </div>

          {/* Tool Usage */}
          {metrics.toolUsage.total > 0 && (
            <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <h2 className="text-lg font-semibold mb-4">Tool Usage</h2>
              <div className="space-y-3">
                {Object.entries(metrics.toolUsage.by_tool).map(([tool, count]) => (
                  <div key={tool} className="flex items-center justify-between">
                    <span className="text-sm">{tool}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-primary"
                          style={{
                            width: `${(count / metrics.toolUsage.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Mode Distribution */}
          {Object.keys(metrics.riskDistribution).length > 0 && (
            <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <h2 className="text-lg font-semibold mb-4">Risk Mode Distribution</h2>
              <div className="space-y-3">
                {Object.entries(metrics.riskDistribution).map(([mode, count]) => {
                  const total = Object.values(metrics.riskDistribution).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);

                  return (
                    <div key={mode} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{mode}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event Types */}
          {Object.keys(metrics.eventsByType).length > 0 && (
            <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <h2 className="text-lg font-semibold mb-4">Events by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(metrics.eventsByType).map(([type, count]) => (
                  <div
                    key={type}
                    className="border border-gray-200 dark:border-gray-700 rounded p-3"
                  >
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{type}</div>
                    <div className="text-xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          {metrics.recentEvents.length > 0 && (
            <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]">
              <h2 className="text-lg font-semibold mb-4">Recent Events (Last 10)</h2>
              <div className="space-y-2 text-xs font-mono">
                {metrics.recentEvents.map((event, i) => (
                  <div
                    key={i}
                    className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{event.event_type}</span>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.tool_name && (
                      <div className="text-gray-600 dark:text-gray-400">
                        Tool: {event.tool_name}
                        {event.action && ` · ${event.action}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {metrics.totalEvents === 0 && (
            <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">No Events Yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the tools to start generating analytics data
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Failed to load metrics</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link href="/ops" className="cv-btn-ghost">
          Back to Ops
        </Link>
        <Link href="/dashboard" className="cv-btn-ghost">
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
