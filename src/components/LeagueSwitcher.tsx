'use client';

import { useEffect, useState } from 'react';
import type { MeLeaguesResponse } from '@/types/leagues';

export function LeagueSwitcher() {
  const [data, setData] = useState<MeLeaguesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch('/app/me/leagues', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch((err) => {
        console.error('[LeagueSwitcher]', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data || data.synced_leagues.length === 0) {
    return null;
  }

  const active = data.active_league ?? data.synced_leagues[0];

  const handleChange = async (newActive: string) => {
    if (updating || newActive === active) return;

    setUpdating(true);
    try {
      await fetch('/app/me/active-league', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ league_key: newActive }),
      });
      setData({ ...data, active_league: newActive });
    } catch (err) {
      console.error('[LeagueSwitcher] Failed to update active league', err);
      // Fallback: could show toast here
    } finally {
      setUpdating(false);
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600 dark:text-gray-400">Active League:</span>
      <select
        className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={active}
        onChange={(e) => handleChange(e.target.value)}
        disabled={updating}
      >
        {data.synced_leagues.map((k) => {
          const L = data.leagues.find((l) => l.key === k);
          return (
            <option key={k} value={k}>
              {L?.name ?? k}
            </option>
          );
        })}
      </select>
      {updating && <span className="text-xs text-gray-500">Updating...</span>}
    </label>
  );
}
