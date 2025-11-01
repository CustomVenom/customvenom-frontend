'use client';

import { useSelectedLeague } from '@/lib/selection';
import { useEffect, useState } from 'react';

// ===== TYPE DEFINITIONS =====

interface Team {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
  league_key: string; // League context - which league this team belongs to
  is_owner?: boolean;
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

interface YahooLeaguesResponse {
  league_keys?: string[];
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
  const [leagues, setLeagues] = useState<YahooLeaguesResponse | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);

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

          // If connected, load leagues
          if (meData.guid) {
            const leaguesRes = await fetch(`${API_BASE}/yahoo/leagues?format=json`, {
              credentials: 'include',
            });
            if (leaguesRes.ok) {
              const leaguesData: YahooLeaguesResponse = await leaguesRes.json();
              setLeagues(leaguesData);
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

  // ===== FILTERING LOGIC =====
  // Filter teams by ownership
  // If user has no owned teams, show all teams by default (fallback)
  const myTeamsCount = teams.filter((t) => t.is_owner).length;
  const shouldShowAll = myTeamsCount === 0 ? true : showAllTeams;
  const filteredTeams = shouldShowAll ? teams : teams.filter((t) => t.is_owner);
  const hasOtherTeams = myTeamsCount > 0 && myTeamsCount < teams.length;

  // Debug logging for filtering
  useEffect(() => {
    if (teams.length > 0) {
      console.log('[FILTER DEBUG] Total teams:', teams.length);
      console.log('[FILTER DEBUG] Teams with is_owner=true:', myTeamsCount);
      console.log('[FILTER DEBUG] showAllTeams:', showAllTeams);
      console.log('[FILTER DEBUG] filteredTeams.length:', filteredTeams.length);
      console.log('[FILTER DEBUG] Button disabled:', filteredTeams.length === 0);
    }
  }, [teams, filteredTeams.length, showAllTeams, myTeamsCount]);

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
          }
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
      }
    };
    loadSelection();
  }, [isConnected, API_BASE]);

  // ===== EFFECT: Load all teams from all leagues (single bulk call) =====
  useEffect(() => {
    if (!isConnected) {
      setTeams([]);
      return;
    }

    const loadAllTeams = async () => {
      try {
        // Single bulk call to get all leagues with teams
        const res = await fetch(`${API_BASE}/providers/yahoo/leagues`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.error('Failed to load leagues:', res.status);
          return;
        }

        const data = await res.json();

        if (data?.leagues && Array.isArray(data.leagues)) {
          const allTeams: Team[] = [];

          for (const league of data.leagues) {
            if (league?.teams && Array.isArray(league.teams)) {
              const leagueId = league.league_id;
              const leagueKey = `461.l.${leagueId}`;

              for (const team of league.teams) {
                allTeams.push({
                  team_key: `461.l.${leagueId}.t.${team.team_id}`,
                  name: team.name,
                  team_logos: team.team_logos,
                  league_key: leagueKey,
                  is_owner: team.is_owner ?? false,
                });
              }
            }
          }

          // Debug logging
          console.log('[TEAMS DEBUG] Total teams loaded:', allTeams.length);
          console.log(
            '[TEAMS DEBUG] Teams with is_owner=true:',
            allTeams.filter((t) => t.is_owner).length,
          );
          console.log('[TEAMS DEBUG] Sample team:', allTeams[0]);
          console.log(
            '[TEAMS DEBUG] All teams:',
            allTeams.map((t) => ({ name: t.name, is_owner: t.is_owner })),
          );

          setTeams(allTeams);
        } else {
          console.warn('[TEAMS DEBUG] No leagues data or invalid format:', data);
        }
      } catch (e) {
        console.error('Failed to load teams:', e);
      }
    };

    loadAllTeams();
  }, [isConnected, API_BASE]);

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

  const handleSelectTeam = async (teamKey: string) => {
    try {
      console.log('[handleSelectTeam] Called with teamKey:', teamKey);
      console.log('[handleSelectTeam] Current teams array length:', teams.length);
      console.log(
        '[handleSelectTeam] All teams:',
        teams.map((t) => ({ team_key: t.team_key, league_key: t.league_key, name: t.name })),
      );

      // Find the team object to get its league_key (more reliable than parsing team_key string)
      const team = teams.find((t) => t.team_key === teamKey);
      if (!team) {
        console.error('[handleSelectTeam] Team not found in teams array:', teamKey);
        console.error(
          '[handleSelectTeam] Available team_keys:',
          teams.map((t) => t.team_key),
        );
        return;
      }

      const leagueKey = team.league_key;

      // Validate that league_key matches the team_key structure
      const expectedLeagueKey = teamKey.split('.t.')[0];
      if (leagueKey !== expectedLeagueKey) {
        console.error('[handleSelectTeam] LEAGUE KEY MISMATCH DETECTED!', {
          teamKey,
          teamLeagueKey: leagueKey,
          expectedLeagueKey,
          teamObject: team,
        });
        // Use the extracted league_key from team_key as fallback
        const correctedLeagueKey = expectedLeagueKey;
        console.log('[handleSelectTeam] Using corrected leagueKey:', correctedLeagueKey);

        const res = await fetch(`${API_BASE}/api/session/selection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ teamKey, leagueKey: correctedLeagueKey }),
        });

        // ... rest of the code
        if (res.ok) {
          setSelectedTeam(teamKey);
          setSelection({ league_key: correctedLeagueKey || null });
          setTeamsDropdownOpen(false);
          window.dispatchEvent(
            new CustomEvent('team-selected', {
              detail: { teamKey, leagueKey: correctedLeagueKey },
            }),
          );
        } else {
          const responseBody = await res.json();
          console.error('[handleSelectTeam] Failed after correction:', responseBody);
        }
        return;
      }

      console.log('[handleSelectTeam] Found team:', { teamKey, leagueKey, teamName: team.name });
      console.log('[handleSelectTeam] About to POST:', { teamKey, leagueKey });

      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey }),
      });

      console.log('[handleSelectTeam] POST response status:', res.status);
      const responseBody = await res.json();
      console.log('[handleSelectTeam] POST response body:', responseBody);

      if (res.ok) {
        setSelectedTeam(teamKey);
        setSelection({ league_key: leagueKey || null });
        setTeamsDropdownOpen(false);

        // Dispatch event for other components that might listen
        window.dispatchEvent(
          new CustomEvent('team-selected', {
            detail: { teamKey, leagueKey },
          }),
        );
      } else {
        console.error('[handleSelectTeam] Failed to save team selection, status:', res.status);
      }
    } catch (e) {
      console.error('[handleSelectTeam] Failed to save team:', e);
    }
  };

  // ===== DERIVED STATE =====

  const selectedTeamObj = selectedTeam ? teams.find((t) => t.team_key === selectedTeam) : null;
  const selectedTeamName = selectedTeamObj?.name || 'Select Your Team';

  // Debug: Log what we're displaying
  useEffect(() => {
    if (selectedTeam) {
      console.log('[DEBUG] Selected team lookup:', {
        selectedTeam,
        teamsCount: teams.length,
        foundTeam: selectedTeamObj,
        selectedTeamName,
      });
    }
  }, [selectedTeam, teams, selectedTeamObj, selectedTeamName]);

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
        {isConnected && (
          <div className="relative" data-team-selector>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTeamsDropdownOpen(!teamsDropdownOpen);
              }}
              disabled={filteredTeams.length === 0}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-xs font-medium shadow-sm disabled:opacity-50 min-w-[180px]"
            >
              <span className="flex-1 text-left truncate">
                {!mounted || filteredTeams.length === 0 ? 'Select Your Team' : selectedTeamName}
              </span>
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
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {/* Toggle button at top if user has other teams */}
                {hasOtherTeams && (
                  <div className="p-2 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllTeams(!showAllTeams);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {showAllTeams
                        ? `My teams only (${myTeamsCount})`
                        : `View all teams (${teams.length})`}
                    </button>
                  </div>
                )}

                {/* Teams list */}
                {filteredTeams.map((team) => (
                  <button
                    key={team.team_key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTeam(team.team_key);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left ${
                      selectedTeam === team.team_key ? 'bg-blue-50' : ''
                    }`}
                  >
                    {team.team_logos?.[0]?.url && (
                      <img
                        src={team.team_logos[0].url}
                        alt=""
                        className="w-8 h-8 rounded shrink-0"
                      />
                    )}
                    <span className="flex-1 text-sm truncate">
                      {team.name}
                      {team.is_owner && ' ⭐'}
                    </span>
                    {selectedTeam === team.team_key && (
                      <svg
                        className="w-5 h-5 text-blue-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}

                {filteredTeams.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No teams available</div>
                )}
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
            Connected — GUID: {me.guid} · Leagues: {leagues?.league_keys?.length || 0}
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
