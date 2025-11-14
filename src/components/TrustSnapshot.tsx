'use client';
import React from 'react';
import type { TrustHeaders } from '@/types/api';
import { useTrustContext } from '@customvenom/lib/trust-context';
import { formatSchema } from '@/lib/trust-format';

type Props = {
  // Legacy props (for backward compatibility)
  ts?: string;
  ver?: string;
  stale?: boolean;
  // New: Trust headers from API response
  trust?: TrustHeaders;
};

export function TrustSnapshot({ ts, ver, stale, trust }: Props) {
  // Use trust context if available (for private routes)
  const trustContext = useTrustContext();

  // Use trust headers if provided, otherwise fall back to trust context, then legacy props
  const rawSchemaVersion = trust?.schemaVersion || trustContext?.schemaVersion || ver || 'unknown';
  const schemaVersion = formatSchema(rawSchemaVersion);
  const lastRefresh =
    trust?.lastRefresh || trustContext?.lastRefresh || ts || new Date().toISOString();
  const isStale = stale !== undefined ? stale : !!trust?.stale;

  const formatted = lastRefresh
    ? new Date(lastRefresh).toLocaleString('en-US', {
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

  const relativeTime = formatRelativeTime(lastRefresh);

  return (
    <div
      aria-label="Trust Snapshot"
      className="fixed bottom-4 right-4 bg-card border rounded-lg px-3 py-2 shadow-lg text-xs z-50"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">Trust: {schemaVersion}</span>
        <span>•</span>
        <time dateTime={lastRefresh} title={formatted}>
          Updated {relativeTime}
        </time>
        {isStale && (
          <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
            stale
          </span>
        )}
      </div>
    </div>
  );
}
