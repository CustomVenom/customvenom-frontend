'use client';
import React from 'react';

type Props = { ts: string; ver: string; stale: boolean };

export function TrustSnapshot({ ts, ver, stale }: Props) {
  const formatted = ts
    ? new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

  return (
    <div aria-label="Trust Snapshot" className="flex items-center gap-2 text-xs opacity-80">
      <span>v{ver}</span>
      <span>•</span>
      <time dateTime={ts}>{formatted}</time>
      {stale && <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-800">stale</span>}
    </div>
  );
}
