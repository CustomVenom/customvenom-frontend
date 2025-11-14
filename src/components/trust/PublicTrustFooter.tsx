'use client';
import { useTrustContext } from '@customvenom/lib/trust-context';

export default function PublicTrustFooter() {
  const { schemaVersion, lastRefresh } = useTrustContext();

  // Only show if we have trust data
  if (!schemaVersion && !lastRefresh) return null;

  const formatTime = (timestamp: string | null | undefined): string => {
    if (!timestamp) return '—';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <footer aria-label="Trust indicators" className="public-trust-footer">
      <div className="trust-content">
        {schemaVersion && (
          <span className="trust-item">
            Schema <strong>{schemaVersion}</strong>
          </span>
        )}
        {lastRefresh && (
          <span className="trust-item">
            Last refresh <strong>{formatTime(lastRefresh)}</strong>
          </span>
        )}
      </div>
    </footer>
  );
}
