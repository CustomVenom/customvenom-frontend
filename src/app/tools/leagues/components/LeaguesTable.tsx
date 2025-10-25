'use client';

import { useState } from 'react';

import ProtectionModeBadge from '@/components/ProtectionModeBadge';
import type { MeLeaguesResponse, LeagueKey } from '@/types/leagues';

interface LeaguesTableProps {
  initialData: MeLeaguesResponse;
}

export default function LeaguesTable({ initialData }: LeaguesTableProps) {
  const [data, setData] = useState<MeLeaguesResponse>(initialData);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const refreshData = async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);

    try {
      let r = await fetch('/app/me/leagues', {
        cache: 'no-store',
        signal: ctrl.signal
      });

      if (!r.ok && r.status >= 500) {
        // One retry on 5xx with 500ms delay
        await new Promise(resolve => setTimeout(resolve, 500));
        r = await fetch('/app/me/leagues', {
          cache: 'no-store',
          signal: ctrl.signal
        });
      }

      if (!r.ok) {
        throw new Error(`leagues_${r.status}`);
      }

      const newData = await r.json();
      setData(newData);
      setError(null);
      setIsStale(r.headers.get('x-stale') === 'true');
    } catch (err) {
      console.error('[LeaguesTable] Failed to refresh', err);
      setError('Service busy. Try again in a moment. See details for requestId.');
    } finally {
      clearTimeout(t);
    }
  };

  const setSynced = async (league_keys: LeagueKey[]) => {
    if (syncing) return;

    setSyncing(true);
    setError(null);

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);

    try {
      let r = await fetch('/app/me/synced-leagues', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ league_keys }),
        signal: ctrl.signal,
      });

      if (!r.ok && r.status >= 500) {
        // One retry on 5xx with 500ms delay
        await new Promise(resolve => setTimeout(resolve, 500));
        r = await fetch('/app/me/synced-leagues', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ league_keys }),
          signal: ctrl.signal,
        });
      }

      if (!r.ok) {
        const result = await r.json();
        throw new Error(result.error || 'Failed to update synced leagues');
      }

      // Optimistic update
      setData({
        ...data,
        synced_leagues: league_keys,
        entitlements: {
          ...data.entitlements,
          used_slots: league_keys.length,
        },
      });

      // Refresh to get accurate entitlements
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Service busy. Try again in a moment.');
      await refreshData(); // Revert optimistic update
    } finally {
      setSyncing(false);
      clearTimeout(t);
    }
  };

  const setActive = async (league_key: LeagueKey) => {
    try {
      const r = await fetch('/app/me/active-league', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ league_key }),
      });

      if (!r.ok) {
        throw new Error('Failed to set active league');
      }

      setData({ ...data, active_league: league_key });
    } catch (err) {
      console.error('[LeaguesTable] Failed to set active league', err);
      setError(err instanceof Error ? err.message : 'Failed to set active league');
    }
  };

  const toggleSync = async (league_key: LeagueKey) => {
    const isSynced = data.synced_leagues.includes(league_key);
    const atCapacity =
      !data.entitlements.is_superuser &&
      data.synced_leagues.length >= data.entitlements.max_sync_slots;

    if (!isSynced && atCapacity) {
      setError('At capacity. Add another slot to sync more leagues.');
      return;
    }

    const newSynced = isSynced
      ? data.synced_leagues.filter((k) => k !== league_key)
      : [...data.synced_leagues, league_key];

    await setSynced(newSynced);
  };

  const { entitlements: ent, leagues, synced_leagues, active_league } = data;
  const atCapacity = !ent.is_superuser && synced_leagues.length >= ent.max_sync_slots;

  if (leagues.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <h3 className="h3 mb-2">No Leagues Found</h3>
        <p className="text-muted mb-4">No leagues found. Refresh after connecting your accounts.</p>
        <button onClick={refreshData} className="cv-btn-primary" disabled={syncing}>
          {syncing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slot Meter */}
      <div data-testid="leagues-table-header" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-medium">Sync Slots:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {ent.used_slots} of {ent.is_superuser ? '∞' : ent.max_sync_slots} used
            </span>
          </div>
          <ProtectionModeBadge isStale={isStale} />
        </div>
        {atCapacity && !ent.is_superuser && (
          <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            Add Slot (Coming Soon)
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Leagues Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                League
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Season
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Team
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Sync
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leagues.map((league) => {
              const isSynced = synced_leagues.includes(league.key);
              const isActive = active_league === league.key;
              const canSync = ent.is_superuser || !atCapacity || isSynced;

              return (
                <tr key={league.key} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{league.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {league.season}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {league.team_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {league.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSynced}
                      onChange={() => toggleSync(league.key)}
                      disabled={syncing || !canSync}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="radio"
                      name="active-league"
                      checked={isActive}
                      onChange={() => setActive(league.key)}
                      disabled={syncing || !isSynced}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {syncing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            Updating...
          </div>
        </div>
      )}
    </div>
  );
}
