'use client';

import { useCallback, useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/Breadcrumb';
import { LeagueContextHeader } from '@/components/LeagueContextHeader';
import { LeaguePageHeader } from '@/components/LeaguePageHeader';
import { ProLock } from '@/components/ProLock';
import { ProviderStatus } from '@/components/ProviderStatus';
import Badge from '@/components/Badge';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { useSession } from '@/hooks/useSession';
import { ScoringFormatSelector } from '@/components/roster/ScoringFormatSelector';

interface EnrichedPlayer {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
  selected_position: { position: string };
  nflverse_id: string | null;
  projected_points: number | null;
  mapped: boolean;
  confidence?: number;
}

interface YahooMeResponse {
  guid?: string;
  auth_required?: boolean;
  error?: string;
}

interface RosterResponse {
  roster: EnrichedPlayer[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
  };
  week: string;
  team_name?: string;
  league_name?: string;
  current_week?: number;
  scoring_type?: string;
  scoring_format?: ScoringFormat;
}

type Tab = 'starters' | 'bench' | 'ir';
type ScoringFormat = 'standard' | 'half_ppr' | 'full_ppr';

function RosterPageClient() {
  const { sess, loading: sessionLoading } = useSession();
  const [data, setData] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('starters');
  const [yahooConnected, setYahooConnected] = useState(false);
  const [scoringFormat, setScoringFormat] = useState<ScoringFormat>('half_ppr');

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  const loadRoster = useCallback(async (format: ScoringFormat) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ scoring_format: format });

      const res = await fetch(`/api/roster?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load roster' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const rosterData = await res.json();
      setData(rosterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster');
      console.error('[RosterPage] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check league connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const meRes = await fetch(`${API_BASE}/yahoo/me`, {
          credentials: 'include',
        });

        if (meRes.ok) {
          const meData: YahooMeResponse = await meRes.json();
          const connected = Boolean(meData.guid);
          setYahooConnected(connected);

          if (!connected) {
            setLoading(false);
          }
        } else {
          setYahooConnected(false);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to check league connection:', e);
        setYahooConnected(false);
        setLoading(false);
      }
    };

    checkConnection();
  }, [API_BASE]);

  useEffect(() => {
    if (!yahooConnected) {
      return;
    }

    loadRoster(scoringFormat);
  }, [yahooConnected, scoringFormat, loadRoster]);

  // Filter players by tab
  const filteredPlayers = data
    ? data.roster.filter((player) => {
        const pos = player.selected_position.position;
        switch (activeTab) {
          case 'starters':
            return pos !== 'BN' && pos !== 'IR';
          case 'bench':
            return pos === 'BN';
          case 'ir':
            return pos === 'IR';
          default:
            return true;
        }
      })
    : [];

  const isPro = false; // TODO: Get from subscription/entitlements API if needed
  const connected = yahooConnected;

  // Check session first
  if (sessionLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    );
  }

  const isLoggedIn = sess && sess.ok;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Roster</h1>
        <div className="mb-6">
          <ProviderStatus provider="yahoo" connected={connected} />
        </div>
        <LeaguePageHeader isPro={isPro} />
        <div className="p-5">
          <p className="text-center text-lg text-gray-600 mb-5">Loading roster...</p>
          <TableSkeleton rows={8} cols={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Roster</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Roster
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={loadRoster}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract week number from week string (format: "2025-01")
  const weekNumber = data?.week ? parseInt(data.week.split('-')[1] || '1', 10) : 1;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Simple login message at top */}
      {!isLoggedIn && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          Please login to see your data.
        </div>
      )}

      {/* Simple connection notice - NOT blocking */}
      {!loading && !connected && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          Connect your league to load player data
        </div>
      )}

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roster', href: '/dashboard/roster' },
        ]}
      />

      {/* League Context Header */}
      {data && (
        <LeagueContextHeader
          leagueName={data.league_name || 'My League'}
          teamName={data.team_name || 'My Team'}
          week={data.current_week || weekNumber}
          scoringType={data.scoring_type || 'Standard'}
        />
      )}

      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Roster</h1>
          <p className="text-muted-foreground mt-1">View your lineup with AI-powered projections</p>
        </div>
        <ScoringFormatSelector
          value={scoringFormat}
          onChange={(value) => setScoringFormat(value)}
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <ProviderStatus provider="yahoo" connected={connected} />
      </div>

      <LeaguePageHeader isPro={isPro} />

      <ProLock isPro={isPro}>
        {data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Players
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {data.stats.total}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Mapped
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.stats.mapped}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Unmapped
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {data.stats.unmapped}
                </div>
              </div>
            </div>

            {/* Warning for unmapped players */}
            {data.stats.unmapped > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>
                    {data.stats.unmapped} player{data.stats.unmapped !== 1 ? 's' : ''}
                  </strong>{' '}
                  {data.stats.unmapped !== 1 ? 'do' : 'does'} not have projections available. This
                  may be due to missing player ID mappings.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8">
                {(['starters', 'bench', 'ir'] as Tab[]).map((tab) => {
                  const count =
                    tab === 'starters'
                      ? data.roster.filter(
                          (p) =>
                            p.selected_position.position !== 'BN' &&
                            p.selected_position.position !== 'IR',
                        ).length
                      : tab === 'bench'
                        ? data.roster.filter((p) => p.selected_position.position === 'BN').length
                        : data.roster.filter((p) => p.selected_position.position === 'IR').length;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Roster Table */}
            {filteredPlayers.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Projected Points
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPlayers.map((player) => (
                      <tr
                        key={player.player_key}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {player.name.full}
                        </td>
                        <td className="px-4 py-3">
                          <Badge intent="neutral" className="text-xs">
                            {player.display_position}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {player.editorial_team_abbr}
                        </td>
                        <td className="px-4 py-3">
                          {player.projected_points !== null ? (
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {player.projected_points.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">â€”</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!player.mapped && (
                            <Badge
                              intent="warning"
                              className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                            >
                              No projection
                            </Badge>
                          )}
                          {player.mapped && player.confidence && (
                            <Badge intent="positive" className="text-xs">
                              {Math.round(player.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No {activeTab} found in your roster.
                </p>
              </div>
            )}

            {/* Week info */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Projections for Week {data.week.split('-')[1]} ({data.week.split('-')[0]})
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No roster data available.</p>
            <button
              onClick={() => loadRoster(scoringFormat)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </ProLock>
    </div>
  );
}

export default function RosterPage() {
  return <RosterPageClient />;
}
