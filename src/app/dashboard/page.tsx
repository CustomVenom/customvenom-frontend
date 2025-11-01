'use client';

import { useSelectedLeague } from '@/lib/selection';
import { useEffect, useState } from 'react';

// ===== TYPE DEFINITIONS =====

interface ProviderTeam {
  team_id: string;
  name: string;
  is_owner?: boolean;
}

interface ProviderLeague {
  league_id: string;
  name: string;
  season: string;
  teams: ProviderTeam[];
}

interface ProviderLeaguesResponse {
  leagues: ProviderLeague[];
}

interface Player {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
}

interface YahooMeResponse {
  guid?: string;
  auth_required?: boolean;
  error?: string;
}

interface YahooRosterResponse {
  roster?: Player[];
  error?: string;
}

interface SessionSelectionResponse {
  active_team_key?: string | null;
  active_league_key?: string | null;
  pinned?: boolean;
}

// ===== MAIN COMPONENT =====

export default function DashboardPage() {
  const { setSelection } = useSelectedLeague();
  const [me, setMe] = useState<YahooMeResponse | null>(null);
  const [leaguesData, setLeaguesData] = useState<ProviderLeaguesResponse | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  // ===== EFFECT: Mark component as mounted (client-side only) =====
  useEffect(() => {
    setMounted(true);
  }, []);

  // ===== EFFECT: Load connection status and leagues =====
  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch(`${API_BASE}/yahoo/me`, {
          credentials: 'include',
        });

        if (meRes.ok) {
          const meData: YahooMeResponse = await meRes.json();
          setMe(meData);

          // If connected, load all leagues with teams in one call
          if (meData.guid) {
            const leaguesRes = await fetch(`${API_BASE}/providers/yahoo/leagues`, {
              credentials: 'include',
              headers: { Accept: 'application/json' },
            });
            if (leaguesRes.ok) {
              const data: ProviderLeaguesResponse = await leaguesRes.json();
              setLeaguesData(data);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load connection status:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  const isConnected = Boolean(me?.guid);

  // ===== EFFECT: Load saved team selection =====
  useEffect(() => {
    if (!isConnected) return;

    const loadSelection = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/session/selection`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data: SessionSelectionResponse = await res.json();
          if (data.active_team_key) {
            setSelectedTeam(data.active_team_key);
            // Extract league_id from team_key (format: "461.l.{leagueId}.t.{teamId}")
            const parts = data.active_team_key.split('.t.');
            if (parts.length === 2) {
              const leagueKey = parts[0];
              if (leagueKey) {
                const leagueIdMatch = leagueKey.match(/\.l\.(\d+)$/);
                if (leagueIdMatch && leagueIdMatch[1]) {
                  setSelectedLeagueId(leagueIdMatch[1]);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
      }
    };
    loadSelection();
  }, [isConnected, API_BASE]);

  // ===== HELPER: Get filtered teams for a league =====
  const getTeamsForLeague = (leagueId: string): ProviderTeam[] => {
    const league = leaguesData?.leagues?.find((l) => l.league_id === leagueId);
    if (!league) return [];

    // Filter to user's teams by default, show all if toggle is on
    if (showAllTeams[leagueId]) {
      return league.teams;
    }

    return league.teams.filter((t) => t.is_owner);
  };

  // ===== EFFECT: Load roster when team selected =====
  useEffect(() => {
    if (!selectedTeam) {
      setRoster([]);
      return;
    }

    const loadRoster = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/yahoo/roster?team_key=${encodeURIComponent(selectedTeam)}`,
          {
            credentials: 'include',
          },
        );

        if (res.ok) {
          const data: YahooRosterResponse = await res.json();
          if (data?.roster && Array.isArray(data.roster)) {
            setRoster(data.roster);
          } else {
            setRoster([]);
          }
        } else {
          console.error('Failed to load roster, status:', res.status);
          setRoster([]);
        }
      } catch (e) {
        console.error('Failed to load roster:', e);
        setRoster([]);
      }
    };

    loadRoster();
  }, [selectedTeam, API_BASE]);

  // ===== EFFECT: Click outside to close dropdown =====
  useEffect(() => {
    if (!teamsDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-team-selector]')) {
        setTeamsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [teamsDropdownOpen]);

  // ===== HANDLERS =====

  const handleConnectOrRefresh = async () => {
    if (connecting) return;
    setConnecting(true);

    try {
      if (!isConnected) {
        // Not connected - redirect to OAuth
        const currentPath = window.location.pathname;
        window.location.href = `${API_BASE}/api/connect/start?host=yahoo&from=${encodeURIComponent(
          currentPath,
        )}`;
        return;
      }

      // Connected - refresh
      window.location.reload();
    } catch (e) {
      console.error('Connect/refresh error:', e);
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectTeam = async (leagueId: string, teamId: string) => {
    if (!teamId || !leagueId) return;

    try {
      // Build team_key in Yahoo format: 461.l.{leagueId}.t.{teamId}
      const teamKey = `461.l.${leagueId}.t.${teamId}`;
      const leagueKey = `461.l.${leagueId}`;

      console.log('[handleSelectTeam] Selecting team:', { leagueId, teamId, teamKey, leagueKey });

      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to save team selection:', {
          status: res.status,
          error: errorData,
          sent: { teamKey, leagueKey },
        });
        return;
      }

      setSelectedTeam(teamKey);
      setSelectedLeagueId(leagueId);
      setSelection({ league_key: leagueKey });
      setTeamsDropdownOpen(false);

      // Dispatch event for other components that might listen
      window.dispatchEvent(
        new CustomEvent('team-selected', {
          detail: { teamKey, leagueKey },
        }),
      );
    } catch (e) {
      console.error('[handleSelectTeam] Failed to save team:', e);
    }
  };

  // ===== DERIVED STATE =====

  // Find selected team name from leagues data
  const selectedTeamName = (() => {
    if (!selectedTeam || !selectedLeagueId || !leaguesData?.leagues) {
      return 'Select Your Team';
    }
    const league = leaguesData.leagues.find((l) => l.league_id === selectedLeagueId);
    if (!league) return 'Select Your Team';
    // Extract team_id from team_key (format: "461.l.{leagueId}.t.{teamId}")
    const parts = selectedTeam.split('.t.');
    if (parts.length !== 2) return 'Select Your Team';
    const teamId = parts[1];
    const team = league.teams.find((t) => t.team_id === teamId);
    return team?.name || 'Select Your Team';
  })();

  // ===== RENDER =====

  // Prevent hydration mismatch by showing loading state until client-side mounted
  if (!mounted || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* BUTTONS - Upper right, below menu bar, smaller */}
      <div className="px-6 py-3 flex items-center justify-end gap-2">
        {/* Button 1: Connect/Refresh League */}
        <button
          onClick={handleConnectOrRefresh}
          disabled={connecting}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs font-medium shadow-sm"
        >
          {connecting ? 'Connecting...' : isConnected ? 'Refresh Leagues' : 'Connect League'}
        </button>

        {/* Button 2: Team selector dropdown (show when connected) */}
        {isConnected && leaguesData?.leagues && leaguesData.leagues.length > 0 && (
          <div className="relative" data-team-selector>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTeamsDropdownOpen(!teamsDropdownOpen);
              }}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-xs font-medium shadow-sm min-w-[180px]"
            >
              <span className="flex-1 text-left truncate">{selectedTeamName}</span>
              <svg
                className={`w-3 h-3 transition-transform shrink-0 ${
                  teamsDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {teamsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[600px] overflow-y-auto z-50">
                {leaguesData.leagues.map((league) => {
                  const teams = getTeamsForLeague(league.league_id);
                  const myTeamsCount = league.teams.filter((t) => t.is_owner).length;
                  const allTeamsCount = league.teams.length;
                  const hasToggle = myTeamsCount < allTeamsCount;

                  return (
                    <div
                      key={league.league_id}
                      className="border-b border-gray-200 last:border-b-0 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{league.name}</h3>
                          <p className="text-xs text-gray-500">Season {league.season}</p>
                        </div>
                        {hasToggle && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAllTeams((prev) => ({
                                ...prev,
                                [league.league_id]: !prev[league.league_id],
                              }));
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {showAllTeams[league.league_id]
                              ? `My teams (${myTeamsCount})`
                              : `View all (${allTeamsCount})`}
                          </button>
                        )}
                      </div>

                      <select
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={
                          selectedLeagueId === league.league_id && selectedTeam
                            ? selectedTeam.split('.t.')[1] || ''
                            : ''
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectTeam(league.league_id, e.target.value);
                          }
                        }}
                      >
                        <option value="">Select your team...</option>
                        {teams.map((team) => (
                          <option key={team.team_id} value={team.team_id}>
                            {team.name} {team.is_owner ? '⭐' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Connection status */}
        {isConnected && me?.guid && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block mb-6">
            Connected — GUID: {me.guid} · Leagues: {leaguesData?.leagues?.length || 0}
          </div>
        )}

        {/* Not connected message */}
        {!isConnected && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Connect your fantasy league to get started</p>
            <p className="text-sm text-gray-500">Click "Connect League" above</p>
          </div>
        )}

        {/* Roster display */}
        {selectedTeam && roster.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Roster</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Player</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Position</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Team</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roster.map((player) => (
                    <tr key={player.player_key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {player.name.full}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          {player.display_position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {player.editorial_team_abbr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty roster state */}
        {selectedTeam && roster.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No roster data available</p>
            <p className="text-sm text-gray-500">Try refreshing or selecting a different team</p>
          </div>
        )}
      </div>
    </div>
  );
}
