'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useYahooApi } from '@/hooks/useYahooApi';
import { PlayerMappingStatus } from './PlayerMappingStatus';

interface YahooLeague {
  league_key: string;
  name: string;
  season: string;
  num_teams: number;
}

interface YahooTeam {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
}

interface Player {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
  nflverse_id?: string | null;
  mapped?: boolean;
  projected_points?: number | null;
  confidence?: number;
}

export function RosterViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, fetchLeagues, fetchTeams } = useYahooApi();
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [_selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [teams, setTeams] = useState<YahooTeam[]>([]);
  const [_selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [view, setView] = useState<'leagues' | 'teams' | 'roster'>('leagues');

  // Pagination state (only for roster view)
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 15; // 15 players per page

  // Group roster by position (moved outside IIFE to fix React hooks violation)
  const groupedByPosition = useMemo(() => {
    const groups: Record<string, Player[]> = {};
    roster.forEach((player) => {
      const pos = player.display_position || 'OTHER';
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(player);
    });
    return groups;
  }, [roster]);

  // Sort positions: QB, RB, WR, TE, K, DEF, then others
  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  const sortedPositions = useMemo(() => {
    return Object.keys(groupedByPosition).sort((a, b) => {
      const aIdx = positionOrder.indexOf(a);
      const bIdx = positionOrder.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }, [groupedByPosition]);

  // Pagination logic
  const totalPages = Math.ceil(roster.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // Flatten grouped roster for pagination
  const flatRoster = useMemo(() => {
    return sortedPositions.flatMap((pos) => groupedByPosition[pos]);
  }, [sortedPositions, groupedByPosition]);

  const paginatedRoster = flatRoster.slice(startIndex, endIndex);

  // Rebuild groups from paginated roster
  const paginatedGroups = useMemo(() => {
    const groups: Record<string, Player[]> = {};
    paginatedRoster.forEach((player) => {
      const pos = player.display_position || 'OTHER';
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(player);
    });
    return groups;
  }, [paginatedRoster]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  // Load leagues on mount - only if connected
  useEffect(() => {
    // Check if user is connected before fetching
    const checkAndFetch = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const meRes = await fetch(`${API_BASE}/yahoo/me`, {
          credentials: 'include',
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          // Only fetch leagues if user is connected
          if (meData.guid) {
            fetchLeagues()
              .then(setLeagues)
              .catch((e) => {
                console.debug(
                  '[RosterViewer] Failed to fetch leagues (expected if not connected)',
                  e,
                );
              });
          }
        }
      } catch (e) {
        // Fail silently - expected if not connected
        console.debug('[RosterViewer] Connection check failed (expected if not logged in)', e);
      }
    };

    checkAndFetch();
  }, [fetchLeagues]);

  const handleLeagueClick = async (leagueKey: string) => {
    setSelectedLeague(leagueKey);
    setView('teams');
    try {
      const teamsData = await fetchTeams(leagueKey);
      setTeams(teamsData);
    } catch (e) {
      console.error('Failed to load teams:', e);
    }
  };

  const handleTeamClick = async (teamKey: string) => {
    setSelectedTeam(teamKey);
    setView('roster');
    try {
      // Use enriched roster API instead of raw Yahoo API
      const res = await fetch(`/api/roster?teamKey=${encodeURIComponent(teamKey)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch roster: ${res.status}`);
      }
      const data = await res.json();
      setRoster(data.roster || []);
    } catch (e) {
      console.error('Failed to load roster:', e);
    }
  };

  const handleBack = () => {
    if (view === 'roster') {
      setView('teams');
      setSelectedTeam(null);
      setRoster([]);
    } else if (view === 'teams') {
      setView('leagues');
      setSelectedLeague(null);
      setTeams([]);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          <strong>Error:</strong> {error}
        </p>
        <p className="text-sm text-red-600 mt-2">
          {error.includes('authenticated') && 'Please connect your fantasy platform first.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      {view !== 'leagues' && (
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back
        </button>
      )}

      {/* Leagues View */}
      {view === 'leagues' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Leagues</h2>
          {loading ? (
            <p className="text-gray-500">Loading leagues...</p>
          ) : leagues.length === 0 ? (
            <p className="text-gray-500">
              No leagues found. Connect your fantasy platform to see your leagues.
            </p>
          ) : (
            <div className="grid gap-3">
              {leagues.map((league) => (
                <button
                  key={league.league_key}
                  onClick={() => handleLeagueClick(league.league_key)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-semibold text-lg">{league.name}</h3>
                  <p className="text-sm text-gray-600">
                    {league.season} • {league.num_teams} teams
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams View */}
      {view === 'teams' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Teams</h2>
          {loading ? (
            <p className="text-gray-500">Loading teams...</p>
          ) : (
            <div className="grid gap-3">
              {teams.map((team) => (
                <button
                  key={team.team_key}
                  onClick={() => handleTeamClick(team.team_key)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-3"
                >
                  {team.team_logos?.[0]?.url && (
                    <img
                      src={team.team_logos[0].url}
                      alt={team.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Roster View */}
      {view === 'roster' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Roster</h2>
          {loading ? (
            <p className="text-gray-500">Loading roster...</p>
          ) : (
            <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
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
                                Projected
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedPositions.map((pos) => {
                              const players = paginatedGroups[pos] || [];
                              if (players.length === 0) return null;

                              return (
                                <React.Fragment key={pos}>
                                  {/* Position header row */}
                                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                                    <td
                                      colSpan={5}
                                      className="px-4 py-2 font-semibold text-sm text-gray-600 dark:text-gray-400"
                                    >
                                      {pos}
                                    </td>
                                  </tr>
                                  {/* Player rows */}
                                  {players.map((player) => (
                                    <tr
                                      key={player.player_key}
                                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                        {player.name.full}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                                          {player.display_position}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {player.editorial_team_abbr}
                                      </td>
                                      <td className="px-4 py-3">
                                        {player.projected_points !== null &&
                                        player.projected_points !== undefined ? (
                                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {player.projected_points.toFixed(1)}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {player.mapped ? (
                                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                                            Mapped
                                          </span>
                                        ) : (
                                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                                            Unmapped
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination Controls - only show if more than 15 players */}
                    {roster.length > 15 && totalPages > 1 && (
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Showing {startIndex + 1}-{Math.min(endIndex, roster.length)} of{' '}
                          {roster.length} players
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 text-sm">
                            {currentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Next page"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {roster.length > 0 && (
                      <div className="mt-6">
                        <PlayerMappingStatus roster={roster} />
                      </div>
                    )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
