'use client';

import React from 'react';

interface TrustRibbonProps {
  schemaVersion?: string;
  lastRefresh?: string;
  stale?: boolean;
  staleAge?: string;
}

/**
 * TrustRibbon: Non-blocking ribbon showing version and freshness
 * Only shows [stale] badge when x-stale=true header is present
 */
export function TrustRibbon({
  schemaVersion = 'v1',
  lastRefresh,
  stale = false,
  staleAge,
}: TrustRibbonProps) {
  const formattedTime = lastRefresh
    ? new Date(lastRefresh).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

  return (
    <>
      {/* Spacer to reserve height and prevent CLS */}
      <div className="h-6" aria-hidden="true" />
      {/* Fixed ribbon overlay */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-green-200 dark:border-green-800 py-1 px-4 text-xs flex items-center justify-center gap-2"
        role="status"
        aria-label="Trust information"
      >
        <span className="text-gray-600 dark:text-gray-400">v{schemaVersion}</span>
        <span className="text-gray-400 dark:text-gray-500">•</span>
        <time dateTime={lastRefresh || ''} className="text-gray-600 dark:text-gray-400">
          {formattedTime}
        </time>
        {stale && (
          <>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-medium">
              [stale]
            </span>
          </>
        )}
      </div>
    </>
  );
}
