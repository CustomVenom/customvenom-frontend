import styles from './Tile.module.css';

interface TileProps {
  title: string;
  value: string | number;
  unit?: string;
  label?: string;
  status: 'live' | 'placeholder';
  loading?: boolean;
}

export function Tile({ title, value, unit, label, status, loading = false }: TileProps) {
  return (
    <div className={`${styles.tile} ${status === 'live' ? styles.live : styles.placeholder}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={status === 'live' ? styles.liveBadge : styles.placeholderBadge}>
          {status === 'live' ? 'LIVE' : 'PLACEHOLDER'}
        </span>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.value}>
            {value}
            {unit && <span className={styles.unit}>{unit}</span>}
          </div>
          {label && (
            <div className={styles.footer}>
              <span className={styles.label}>{label}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface DualTileProps {
  title: string;
  values: {
    speak: number;
    suppress: number;
  };
  label?: string;
  status: 'live' | 'placeholder';
  loading?: boolean;
}

export function DualTile({ title, values, label, status, loading = false }: DualTileProps) {
  return (
    <div className={`${styles.tile} ${status === 'live' ? styles.live : styles.placeholder}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={status === 'live' ? styles.liveBadge : styles.placeholderBadge}>
          {status === 'live' ? 'LIVE' : 'PLACEHOLDER'}
        </span>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.dualValue}>
            <div className={styles.dualItem}>
              <span className={styles.dualLabel}>Speak</span>
              <span className={styles.dualNumber}>{values.speak}</span>
            </div>
            <div className={styles.dualDivider}>/</div>
            <div className={styles.dualItem}>
              <span className={styles.dualLabel}>Suppress</span>
              <span className={styles.dualNumber}>{values.suppress}</span>
            </div>
          </div>
          {label && (
            <div className={styles.footer}>
              <span className={styles.label}>{label}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

