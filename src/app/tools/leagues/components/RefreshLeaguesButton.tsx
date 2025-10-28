'use client';

import { fetchJson } from '@/lib/api';
import { useState } from 'react';

export function RefreshLeaguesButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="cv-btn-secondary text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          // Trigger Yahoo fetch (which triggers upsert)
          await fetchJson('/api/providers/yahoo/leagues');
          // Refresh the page to show updated data
          location.reload();
        } catch (err) {
          console.error('[Refresh leagues error]', err);
          // Could show toast here
        } finally {
          setLoading(false);
        }
      }}
      aria-label="Refresh leagues"
    >
      {loading ? 'Refreshing…' : 'Refresh Leagues'}
    </button>
  );
}
