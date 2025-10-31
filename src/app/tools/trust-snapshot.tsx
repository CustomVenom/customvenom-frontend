type TrustSnapshotProps = {
  schemaVersion: string;
  lastRefresh: string;
  isStale: boolean;
};

export function TrustSnapshot({ schemaVersion, lastRefresh, isStale }: TrustSnapshotProps) {
  const formatted = new Date(lastRefresh).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div
      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
      role="status"
      aria-label="Data freshness"
      style={{ minHeight: '1.5rem' }} // Pre-allocate space for CLS < 0.1
    >
      <span className="font-mono">v{schemaVersion}</span>
      <span>•</span>
      <time dateTime={lastRefresh}>{formatted}</time>
      {isStale && (
        <span className="ml-2 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 font-medium">
          stale
        </span>
      )}
    </div>
  );
}
