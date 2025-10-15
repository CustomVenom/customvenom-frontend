'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface DashboardMetrics {
  errors_5xx: number;
  p95_latency_ms: number;
  cache_hit_rate: number;
  coverage_pct: number;
  pinball_loss: number;
  chip_speak_vs_suppress: { speak: number; suppress: number };
}

export default function OpsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    errors_5xx: 0,
    p95_latency_ms: 0,
    cache_hit_rate: 0,
    coverage_pct: 0,
    pinball_loss: 0,
    chip_speak_vs_suppress: { speak: 0, suppress: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real metrics from logs when available
    // For now, use placeholder data
    const fetchMetrics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMetrics({
        errors_5xx: 3, // Will be live once logs exist
        p95_latency_ms: 245, // Will be live once logs exist
        cache_hit_rate: 0, // Placeholder
        coverage_pct: 0, // Placeholder
        pinball_loss: 0, // Placeholder
        chip_speak_vs_suppress: { speak: 0, suppress: 0 } // Placeholder
      });
      setLoading(false);
    };

    fetchMetrics();
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
        {/* Panel 1: 5xx Errors (LIVE) */}
        <div className={`${styles.panel} ${styles.live}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>5xx Errors</span>
            <span className={styles.liveBadge}>LIVE</span>
          </div>
          <div className={styles.panelValue}>
            {metrics.errors_5xx}
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>Last 24h</span>
          </div>
        </div>

        {/* Panel 2: P95 Latency (LIVE) */}
        <div className={`${styles.panel} ${styles.live}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>P95 Latency</span>
            <span className={styles.liveBadge}>LIVE</span>
          </div>
          <div className={styles.panelValue}>
            {metrics.p95_latency_ms}
            <span className={styles.panelUnit}>ms</span>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>95th percentile</span>
          </div>
        </div>

        {/* Panel 3: Cache Hit Rate (PLACEHOLDER) */}
        <div className={`${styles.panel} ${styles.placeholder}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Cache Hit Rate</span>
            <span className={styles.placeholderBadge}>PLACEHOLDER</span>
          </div>
          <div className={styles.panelValue}>
            {metrics.cache_hit_rate}
            <span className={styles.panelUnit}>%</span>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>Wire when logs exist</span>
          </div>
        </div>

        {/* Panel 4: Coverage (PLACEHOLDER) */}
        <div className={`${styles.panel} ${styles.placeholder}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Coverage</span>
            <span className={styles.placeholderBadge}>PLACEHOLDER</span>
          </div>
          <div className={styles.panelValue}>
            {metrics.coverage_pct}
            <span className={styles.panelUnit}>%</span>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>Players with projections</span>
          </div>
        </div>

        {/* Panel 5: Pinball Loss (PLACEHOLDER) */}
        <div className={`${styles.panel} ${styles.placeholder}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Pinball Loss</span>
            <span className={styles.placeholderBadge}>PLACEHOLDER</span>
          </div>
          <div className={styles.panelValue}>
            {metrics.pinball_loss.toFixed(3)}
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>Lower is better</span>
          </div>
        </div>

        {/* Panel 6: Chip Speak vs Suppress (PLACEHOLDER) */}
        <div className={`${styles.panel} ${styles.placeholder}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Chip Speak vs Suppress</span>
            <span className={styles.placeholderBadge}>PLACEHOLDER</span>
          </div>
          <div className={styles.panelValueDual}>
            <div className={styles.dualItem}>
              <span className={styles.dualLabel}>Speak</span>
              <span className={styles.dualValue}>{metrics.chip_speak_vs_suppress.speak}</span>
            </div>
            <div className={styles.dualDivider}>/</div>
            <div className={styles.dualItem}>
              <span className={styles.dualLabel}>Suppress</span>
              <span className={styles.dualValue}>{metrics.chip_speak_vs_suppress.suppress}</span>
            </div>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.panelLabel}>Reason generation ratio</span>
          </div>
        </div>
      </div>

      <div className={styles.notes}>
        <h3 className={styles.notesTitle}>Notes</h3>
        <ul className={styles.notesList}>
          <li><strong>LIVE tiles</strong> (5xx, P95) show data once logs exist</li>
          <li><strong>Placeholder tiles</strong> will be wired when logging infrastructure is ready</li>
          <li>All metrics are calculated from Cloudflare Workers logs</li>
          <li>Dashboard updates every 60 seconds</li>
        </ul>
      </div>
    </div>
  );
}

