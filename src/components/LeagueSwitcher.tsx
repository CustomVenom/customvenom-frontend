'use client';

import { useEffect, useState } from 'react';
import type { MeLeaguesResponse } from '@/types/leagues';
import { safeJson } from '@/lib/safe-json';

export function LeagueSwitcher() {
  const [data, setData] = useState<MeLeaguesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/app/me/leagues', { 
          cache: 'no-store',
          headers: { 'accept': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Non-JSON response');
        }

        const text = await res.text();
        const json = safeJson<MeLeaguesResponse>(text, null);

        if (!cancelled) {
          if (json) {
            setData(json);
            setError(null);
          } else {
            setError('Invalid response');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('[LeagueSwitcher]', err);
          setError(err?.message || 'Failed to load leagues');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <span className="text-xs text-gray-500">Loading leagues…</span>;
  }

  if (error) {
    return <span className="text-xs text-gray-500">Leagues unavailable</span>;
  }

  if (!data || data.synced_leagues.length === 0) {
    return <span className="text-xs text-gray-500">No leagues</span>;
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
