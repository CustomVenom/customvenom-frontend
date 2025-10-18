'use client';
import { useEffect, useState } from 'react';
import { Tile, DualTile } from '@/components/Tile';
import { fetchLogMetrics } from '@/lib/logs';

interface DashboardMetrics {
  errors_5xx: number;
  p95_latency_ms: number;
  cache_hit_rate: number | null;
  coverage_pct: number;
  pinball_loss: number;
  chip_speak_vs_suppress: { speak: number; suppress: number };
}

export default function OpsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    errors_5xx: 0,
    p95_latency_ms: 0,
    cache_hit_rate: null,
    coverage_pct: 0,
    pinball_loss: 0,
    chip_speak_vs_suppress: { speak: 0, suppress: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [logsAvailable, setLogsAvailable] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch from logs for 5xx and P95
        const logMetrics = await fetchLogMetrics();
        
        // Fetch ops data for other tiles
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
        const opsResponse = await fetch(`${apiBase}/ops-data`);
        const opsData = await opsResponse.json();
        
        setMetrics({
          errors_5xx: logMetrics?.errors_5xx || 0,
          p95_latency_ms: logMetrics?.p95_latency_ms || 0,
          cache_hit_rate: opsData?.cache?.rate || null,
          coverage_pct: opsData?.coverage?.overall || 0,
          pinball_loss: opsData?.pinball?.overall || 0,
          chip_speak_vs_suppress: {
            speak: opsData?.chips?.speak || 0,
            suppress: opsData?.chips?.suppress || 0
          }
        });
        
        setLogsAvailable(!!logMetrics);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="text-center text-xl text-gray-600 py-10">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 m-0">Ops Dashboard</h1>
        <span className="text-lg text-gray-600 mt-2 block">6-Panel Monitoring</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {/* Tile 1: 5xx Errors */}
        <Tile
          title="5xx Errors"
          value={logsAvailable ? metrics.errors_5xx : 'awaiting source'}
          label="Last 24h"
          status={logsAvailable ? 'live' : 'placeholder'}
          loading={loading}
        />

        {/* Tile 2: P95 Latency */}
        <Tile
          title="P95 Latency"
          value={logsAvailable ? metrics.p95_latency_ms : 'awaiting source'}
          unit={logsAvailable ? 'ms' : undefined}
          label="95th percentile"
          status={logsAvailable ? 'live' : 'placeholder'}
          loading={loading}
        />

        {/* Tile 3: Cache Hit Rate */}
        <Tile
          title="Cache Hit Rate"
          value={metrics.cache_hit_rate !== null ? metrics.cache_hit_rate : 'awaiting source'}
          unit={metrics.cache_hit_rate !== null ? '%' : undefined}
          label="R2 cache performance"
          status={metrics.cache_hit_rate !== null ? 'live' : 'placeholder'}
          loading={loading}
        />

        {/* Tile 4: Coverage by Position */}
        <Tile
          title="Coverage"
          value={metrics.coverage_pct || 'awaiting source'}
          unit={metrics.coverage_pct ? '%' : undefined}
          label="Players with projections"
          status={metrics.coverage_pct ? 'live' : 'placeholder'}
          loading={loading}
        />

        {/* Tile 5: Pinball Loss */}
        <Tile
          title="Pinball Loss"
          value={metrics.pinball_loss || 'awaiting source'}
          label="Lower is better"
          status={metrics.pinball_loss ? 'live' : 'placeholder'}
          loading={loading}
        />

        {/* Tile 6: Chip Speak vs Suppress */}
        <DualTile
          title="Chip Speak vs Suppress"
          values={metrics.chip_speak_vs_suppress}
          label="Reason generation ratio"
          status={(metrics.chip_speak_vs_suppress.speak > 0 || metrics.chip_speak_vs_suppress.suppress > 0) ? 'live' : 'placeholder'}
          loading={loading}
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">Notes</h3>
        <ul className="m-0 pl-6 text-gray-700 leading-relaxed">
          <li className="mb-2"><strong className="text-gray-800">LIVE tiles</strong> show data once logs exist</li>
          <li className="mb-2"><strong className="text-gray-800">5xx & P95:</strong> From Cloudflare Workers logs</li>
          <li className="mb-2"><strong className="text-gray-800">Cache, Coverage, Pinball, Chips:</strong> From /ops-data endpoint</li>
          <li className="mb-2">Dashboard auto-refreshes every 60 seconds</li>
          <li className="mb-2">Aim: 5xx = 0, P95 &lt; 300ms, Cache &gt; 80%</li>
        </ul>
      </div>
    </div>
  );
}

