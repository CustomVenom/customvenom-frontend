'use client';
import { useEffect, useState } from 'react';
import styles from './FaabBands.module.css';

interface FaabItem {
  player_id: string;
  name: string;
  team: string;
  position: string;
  suggested_min: number;
  suggested_mid: number;
  suggested_max: number;
  reason: string;
  confidence: number;
}

interface FaabBandsProps {
  week?: string;
}

export function FaabBands({ week = '2025-06' }: FaabBandsProps) {
  const [items, setItems] = useState<FaabItem[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaabBands = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
        const response = await fetch(`${apiBase}/faab_bands?week=${week}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch FAAB bands: ${response.status}`);
        }

        const data = await response.json();
        setItems(data.items || []);
        setSchemaVersion(data.schema_version || 'v1');
        setLastRefresh(data.last_refresh || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch FAAB bands');
      } finally {
        setLoading(false);
      }
    };

    fetchFaabBands();
  }, [week]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading FAAB suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>FAAB Bid Bands</h2>
          <div className={styles.trustInfo}>
            <span className={styles.trustLabel}>Schema: {schemaVersion}</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>💰</span>
          <span className={styles.emptyText}>No FAAB suggestions</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>FAAB Bid Bands</h2>
        <div className={styles.trustInfo}>
          <span className={styles.trustLabel}>Schema: {schemaVersion}</span>
          {lastRefresh && (
            <span className={styles.trustValue}>
              · Updated {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className={styles.bandsList}>
        {items.map((item, index) => (
          <div key={item.player_id} className={styles.bandItem}>
            <div className={styles.bandHeader}>
              <div className={styles.playerInfo}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.playerName}>{item.name}</span>
                <span className={styles.playerMeta}>
                  {item.team} · {item.position}
                </span>
              </div>
              <div className={styles.confidence}>
                <span className={styles.confidenceValue}>
                  {(item.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className={styles.bands}>
              <div className={styles.band}>
                <span className={styles.bandLabel}>Min</span>
                <span className={styles.bandValue}>${item.suggested_min}</span>
              </div>
              <div className={`${styles.band} ${styles.bandMid}`}>
                <span className={styles.bandLabel}>Mid</span>
                <span className={styles.bandValue}>${item.suggested_mid}</span>
              </div>
              <div className={styles.band}>
                <span className={styles.bandLabel}>Max</span>
                <span className={styles.bandValue}>${item.suggested_max}</span>
              </div>
            </div>

            {item.reason && (
              <div className={styles.reason}>
                <span className={styles.reasonIcon}>💡</span>
                <span className={styles.reasonText}>{item.reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

