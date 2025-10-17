'use client';
import { useEffect, useState } from 'react';
import { Tile, DualTile } from '@/components/Tile';
import { fetchLogMetrics } from '@/lib/logs';
import styles from './page.module.css';

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
      // Fetch from logs when available
      const logMetrics = await fetchLogMetrics();
      
      if (logMetrics) {
        setMetrics({
          errors_5xx: logMetrics.errors_5xx,
          p95_latency_ms: logMetrics.p95_latency_ms,
          cache_hit_rate: logMetrics.cache_hit_rate,
          coverage_pct: 0, // awaiting source
          pinball_loss: 0, // awaiting source
          chip_speak_vs_suppress: { speak: 0, suppress: 0 } // awaiting source
        });
        setLogsAvailable(true);
      } else {
        // Logs not available yet - use placeholder values
      setMetrics({
          errors_5xx: 0,
          p95_latency_ms: 0,
          cache_hit_rate: null,
          coverage_pct: 0,
          pinball_loss: 0,
          chip_speak_vs_suppress: { speak: 0, suppress: 0 }
        });
        setLogsAvailable(false);
      }
      
      setLoading(false);
    };

    fetchMetrics();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ops Dashboard</h1>
        <span className={styles.subtitle}>6-Panel Monitoring</span>
      </div>

      <div className={styles.grid}>
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
          value="awaiting source"
          unit="%"
          label="Wire when logs exist"
          status="placeholder"
          loading={loading}
        />

        {/* Tile 4: Coverage by Position */}
        <Tile
          title="Coverage by Position"
          value="awaiting source"
          unit="%"
          label="Players with projections"
          status="placeholder"
          loading={loading}
        />

        {/* Tile 5: Pinball by Position */}
        <Tile
          title="Pinball by Position"
          value="awaiting source"
          label="Lower is better"
          status="placeholder"
          loading={loading}
        />

        {/* Tile 6: Chip Speak vs Suppress */}
        <DualTile
          title="Chip Speak vs Suppress"
          values={{ speak: 0, suppress: 0 }}
          label="Reason generation ratio"
          status="placeholder"
          loading={loading}
        />
      </div>

      <div className={styles.notes}>
        <h3 className={styles.notesTitle}>Notes</h3>
        <ul className={styles.notesList}>
          <li><strong>LIVE tiles</strong> (5xx, P95) display live values when logs are present</li>
          <li><strong>Placeholder tiles</strong> show "awaiting source" until data is available</li>
          <li>All metrics will be calculated from Cloudflare Workers logs</li>
          <li>Dashboard auto-refreshes every 60 seconds</li>
        </ul>
      </div>
    </div>
  );
}

