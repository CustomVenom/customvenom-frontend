'use client';

import { useEffect, useState } from 'react';
import type { MeLeaguesResponse } from '@/types/leagues';
import { LeagueChooser } from './LeagueChooser';

export function LeagueSwitcher() {
  const [data, setData] = useState<MeLeaguesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleChange = async (newActive: string) => {
    if (updating) return;

    setUpdating(true);
    try {
      await fetch('/app/me/active-league', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ league_key: newActive }),
      });
      localStorage.setItem('cv_last_league', newActive);
      setSelectedLeague(newActive);
      setData((prev) => prev ? { ...prev, active_league: newActive } : null);
    } catch (err) {
      console.error('[LeagueSwitcher] Failed to update active league', err);
    } finally {
      setUpdating(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch('/api/leagues', {
        cache: 'no-store',
        headers: { 'accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        throw new Error('leagues_endpoint_not_found');
      }
      if (res.status === 401) {
        throw new Error('auth_required');
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response');
      }

      const json: MeLeaguesResponse = await res.json();

      setData(json);
      setError(null);

      // Check for saved league preference
      const savedLeague = localStorage.getItem('cv_last_league');
      if (savedLeague && json.synced_leagues.includes(savedLeague)) {
        setSelectedLeague(savedLeague);
      } else if (json.synced_leagues.length === 1) {
        // Auto-select if only one league
        setSelectedLeague(json.synced_leagues[0]);
      }
      // else: show chooser (no auto-select)
    } catch (err: unknown) {
      console.error('[LeagueSwitcher]', err);
      const message = err instanceof Error ? err.message : 'Failed to load leagues';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [retryCount]);

  if (loading) {
    return <span className="text-xs text-gray-500">Loading leagues…</span>;
  }

  if (error) {
    const errorMessage = error === 'leagues_endpoint_not_found' 
      ? 'Leagues endpoint not ready'
      : error === 'auth_required'
      ? 'Authentication required'
      : 'Leagues unavailable';
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{errorMessage}</span>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            setRetryCount((c) => c + 1);
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.synced_leagues.length === 0) {
    return <span className="text-xs text-gray-500">No leagues</span>;
  }

  // Show chooser if multiple leagues and none selected
  if (data.synced_leagues.length > 1 && !selectedLeague) {
    return (
      <LeagueChooser
        leagues={data.synced_leagues.map((k) => {
          const L = data.leagues.find((l) => l.key === k);
          return { id: k, name: L?.name ?? k };
        })}
        onPick={handleChange}
      />
    );
  }

  const active = selectedLeague ?? data.active_league ?? data.synced_leagues[0];

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
