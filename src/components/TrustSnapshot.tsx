import React from 'react';

interface TrustSnapshotProps {
  lastRefresh?: string;
  schemaVersion?: string;
  stale?: boolean;
  staleAge?: string | null;
}

export function TrustSnapshot({
  lastRefresh,
  schemaVersion = 'v1',
  stale = false,
  staleAge
}: TrustSnapshotProps) {
  const formattedDate = lastRefresh
    ? new Date(lastRefresh).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : '—';

  const staleSeconds = staleAge ? parseInt(staleAge, 10) : 0;
  const staleMinutes = Math.floor(staleSeconds / 60);
  const staleDisplay = staleMinutes > 0
    ? `${staleMinutes}m ago`
    : `${staleSeconds}s ago`;

  return (
    <div className="flex items-center gap-3 text-sm" aria-label="Trust Snapshot">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Schema:</span>
        <span className="font-mono text-gray-700">{schemaVersion}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500">Calibrated:</span>
        <time
          dateTime={lastRefresh || ''}
          className={stale ? 'opacity-60 text-gray-600' : 'text-gray-700'}
        >
          {formattedDate}
        </time>
      </div>

      {stale && (
        <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium">
          Stale {staleAge && `· ${staleDisplay}`}
        </span>
      )}
    </div>
  );
}

