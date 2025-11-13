'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UsageMetrics {
  ok: boolean;
  requests_today: number;
  requests_limit: number;
  d1_reads_month: number;
  d1_reads_limit: number;
  d1_writes_month: number;
  d1_writes_limit: number;
  r2_reads_month: number;
  r2_reads_limit: number;
  r2_writes_month: number;
  r2_writes_limit: number;
  projected_cost: number;
  top_ips: Array<{ ip: string; requests: number }>;
  rate_limited_ips: Array<{ ip: string; violations: number }>;
}

interface UsageHistory {
  ok: boolean;
  requests: Array<{ date: string; count: number }>;
  d1: Array<{ month: string; reads: number; writes: number }>;
  r2: Array<{ month: string; reads: number; writes: number }>;
}

function UsageCard({
  title,
  current,
  limit,
  unit,
}: {
  title: string;
  current: number;
  limit: number;
  unit: string;
}) {
  const pct = limit > 0 ? (current / limit) * 100 : 0;
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
  const textColor = pct > 90 ? 'text-red-600' : pct > 70 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="mb-2">
        <span className="text-3xl font-bold">{current.toLocaleString()}</span>
        <span className="text-gray-400">
          {' '}
          / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
        <div className={`h-4 rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className={`text-sm font-semibold ${textColor}`}>{pct.toFixed(1)}% used</div>
    </div>
  );
}

function SimpleChart({
  data,
  label,
  color = 'blue',
}: {
  data: Array<{ date: string; value: number }>;
  label: string;
  color?: string;
}) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-400">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold mb-2">{label}</h4>
      <div className="flex items-end gap-1 h-32">
        {data.map((item, i) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full bg-${color}-500 rounded-t`}
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                {item.date.slice(5)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UsagePage() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [history, setHistory] = useState<UsageHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [metricsRes, historyRes] = await Promise.all([
          fetch('/api/admin/usage'),
          fetch('/api/admin/usage/history'),
        ]);

        if (!metricsRes.ok) {
          throw new Error('Failed to load metrics');
        }

        const metricsData = await metricsRes.json();
        setMetrics(metricsData);

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-pulse text-4xl mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-400">Loading usage metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Metrics
          </h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Usage Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time usage metrics and cost projections
          </p>
        </div>
        <Link href="/ops" className="cv-btn-ghost">
          Back to Ops
        </Link>
      </div>

      {/* Cost Projection */}
      {metrics.projected_cost > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Projected Cost This Month
              </h3>
              <p className="text-yellow-600 dark:text-yellow-300">
                ${metrics.projected_cost.toFixed(2)} - Exceeds free tier threshold
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <UsageCard
          title="Requests Today"
          current={metrics.requests_today}
          limit={metrics.requests_limit}
          unit="requests"
        />
        <UsageCard
          title="D1 Reads (Month)"
          current={metrics.d1_reads_month}
          limit={metrics.d1_reads_limit}
          unit="rows"
        />
        <UsageCard
          title="D1 Writes (Month)"
          current={metrics.d1_writes_month}
          limit={metrics.d1_writes_limit}
          unit="rows"
        />
        <UsageCard
          title="R2 Reads (Month)"
          current={metrics.r2_reads_month}
          limit={metrics.r2_reads_limit}
          unit="reads"
        />
      </div>

      {/* Historical Charts */}
      {history && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Requests (Last 30 Days)</h3>
            <SimpleChart
              data={history.requests.map((r) => ({
                date: r.date,
                value: r.count,
              }))}
              label="Daily Requests"
              color="blue"
            />
          </div>
          <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">D1 Usage (Last 3 Months)</h3>
            <div className="space-y-4">
              <SimpleChart
                data={history.d1.map((d) => ({
                  date: d.month,
                  value: d.reads,
                }))}
                label="Reads"
                color="green"
              />
              <SimpleChart
                data={history.d1.map((d) => ({
                  date: d.month,
                  value: d.writes,
                }))}
                label="Writes"
                color="yellow"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top IPs */}
      {metrics.top_ips.length > 0 && (
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Top IPs by Request Count</h3>
          <div className="space-y-2">
            {metrics.top_ips.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span className="font-mono text-sm">{item.ip}</span>
                <span className="font-semibold">{item.requests.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Limited IPs */}
      {metrics.rate_limited_ips.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200">
            Rate Limited IPs
          </h3>
          <div className="space-y-2">
            {metrics.rate_limited_ips.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-red-100 dark:bg-red-900/40 rounded"
              >
                <span className="font-mono text-sm">{item.ip}</span>
                <span className="font-semibold text-red-800 dark:text-red-200">
                  {item.violations} violations
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
