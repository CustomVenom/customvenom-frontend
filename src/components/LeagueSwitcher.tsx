'use client';

import { useEffect, useState } from 'react';

import { LeagueChooser } from './LeagueChooser';

import type { MeLeaguesResponse } from '@/types/leagues';

export function LeagueSwitcher() {
  const [data, setData] = useState<
    (MeLeaguesResponse & { defaultLeagueId?: string; lastSync?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
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
      setData((prev) => (prev ? { ...prev, active_league: newActive } : null));
    } catch (err) {
      console.error('[LeagueSwitcher] Failed to update active league', err);
    } finally {
      setUpdating(false);
    }
  };

  const fetchLeagues = async () => {
    let requestId = 'no-request-id';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch('/api/leagues', {
        cache: 'no-store',
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      requestId = res.headers.get('x-request-id') || 'no-request-id';

      if (res.status === 404) {
        setErrorDetails(
          JSON.stringify({ requestId, status: res.status, statusText: res.statusText }, null, 2),
        );
        throw new Error('leagues_endpoint_not_found');
      }
      if (res.status === 401) {
        setErrorDetails(
          JSON.stringify({ requestId, status: res.status, statusText: res.statusText }, null, 2),
        );
        throw new Error('auth_required');
      }
      if (!res.ok) {
        setErrorDetails(
          JSON.stringify({ requestId, status: res.status, statusText: res.statusText }, null, 2),
        );
        throw new Error(`HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response');
      }

      const json: MeLeaguesResponse & { defaultLeagueId?: string; lastSync?: string } =
        await res.json();

      // Handle empty leagues array explicitly
      if (!json.leagues || json.leagues.length === 0) {
        console.warn('[LeagueSwitcher] Empty leagues array returned');
        setData({
          ...json,
          leagues: [],
          synced_leagues: [],
        });
        setError('No leagues found. Try refreshing your league data.');
        setErrorDetails(
          JSON.stringify(
            {
              requestId,
              connections: json.connections?.length || 0,
              leagueCount: json.leagues?.length || 0,
            },
            null,
            2,
          ),
        );
        return;
      }

      setData(json);
      setError(null);

      // Use server defaultLeagueId first, then localStorage, then auto-select single league
      const serverDefault = json.defaultLeagueId;
      const savedLeague = localStorage.getItem('cv_last_league');

      if (serverDefault && json.synced_leagues.includes(serverDefault)) {
        setSelectedLeague(serverDefault);
      } else if (savedLeague && json.synced_leagues.includes(savedLeague)) {
        setSelectedLeague(savedLeague);
      } else if (json.synced_leagues.length === 1) {
        const firstLeague = json.synced_leagues[0];
        if (firstLeague) {
          setSelectedLeague(firstLeague);
        }
      }
      // else: show chooser (no auto-select)
    } catch (err: unknown) {
      console.error('[LeagueSwitcher]', err);
      const message = err instanceof Error ? err.message : 'Failed to load leagues';
      setError(message);
      setErrorDetails(
        JSON.stringify(
          {
            requestId,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/leagues/refresh', {
        method: 'POST',
        headers: { accept: 'application/json' },
      });

      if (res.ok) {
        // Wait a moment for backend to process, then reload
        setTimeout(() => {
          fetchLeagues();
        }, 1000);
      }
    } catch (err) {
      console.error('[LeagueSwitcher] Refresh failed', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [retryCount]);

  if (loading) {
    return <span className="text-xs text-gray-500">Loading leagues…</span>;
  }

  if (error) {
    const errorMessage =
      error === 'leagues_endpoint_not_found'
        ? 'Leagues endpoint not ready'
        : error === 'auth_required'
          ? 'Authentication required'
          : error;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{errorMessage}</span>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setErrorDetails(null);
              setRetryCount((c) => c + 1);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
        {errorDetails && (
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
              {showDetails && (
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(errorDetails);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Copy details
                </button>
              )}
            </div>
            {showDetails && (
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                {errorDetails}
              </pre>
            )}
          </div>
        )}
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
  const lastSyncDisplay = data.lastSync ? new Date(data.lastSync).toLocaleDateString() : null;

  return (
    <div className="flex items-center gap-3">
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

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
      >
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>

      {lastSyncDisplay && (
        <span className="text-xs text-gray-500">Last sync: {lastSyncDisplay}</span>
      )}
    </div>
  );
}
