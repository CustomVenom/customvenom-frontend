'use client';
import React from 'react';

type Props = {
  ts: string;
  ver: string;
  stale: boolean;
  accuracy7d?: number; // 0.0-1.0, e.g., 0.91 for 91%
  predictionsTracked?: number;
};

export function TrustSnapshot({ ts, ver, stale, accuracy7d, predictionsTracked }: Props) {
  const formatted = ts
    ? new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (timestamp: string): string => {
    if (!timestamp) return '—';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatted;
  };

  const relativeTime = formatRelativeTime(ts);
  const accuracyText =
    accuracy7d !== undefined ? `${Math.round(accuracy7d * 100)}% accurate` : null;

  return (
    <div aria-label="Trust Snapshot" className="flex items-center gap-2 text-xs opacity-80">
      <span className="font-medium">Trust: v{ver}</span>
      <span>•</span>
      <time dateTime={ts} title={formatted}>
        Updated {relativeTime}
      </time>
      {accuracyText && (
        <>
          <span>•</span>
          <span className="text-[rgb(var(--cv-primary))]">{accuracyText}</span>
          {predictionsTracked !== undefined && predictionsTracked > 0 && (
            <span className="text-[rgb(var(--text-muted))]">
              ({predictionsTracked.toLocaleString()} predictions)
            </span>
          )}
        </>
      )}
      {stale && (
        <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
          stale
        </span>
      )}
    </div>
  );
}
