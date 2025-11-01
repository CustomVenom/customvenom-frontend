'use client';

import { useSelectedLeague } from '@/lib/selection';
import { useEffect, useState } from 'react';

// ===== TYPE DEFINITIONS =====

interface Team {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
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

interface YahooTeamsResponse {
  teams?: Team[];
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

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

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

  // ===== EFFECT: Load all teams from all leagues =====
  useEffect(() => {
    if (!isConnected || !leagues?.league_keys || !Array.isArray(leagues.league_keys)) {
      setTeams([]);
      return;
    }

    const loadAllTeams = async () => {
      try {
        const leagueKeys = leagues.league_keys;

        // Type guard to ensure we have an array of strings
        if (!Array.isArray(leagueKeys) || leagueKeys.length === 0) {
          return;
        }

        // Load all leagues in parallel
        console.log('[DEBUG] Loading teams for leagues:', leagueKeys);
        const teamPromises = leagueKeys.map(async (leagueKey) => {
          if (typeof leagueKey !== 'string') {
            console.warn('[DEBUG] Invalid leagueKey (not string):', leagueKey);
            return [];
          }

          const url = `${API_BASE}/yahoo/leagues/${encodeURIComponent(leagueKey)}/teams?format=json`;
          console.log(`[DEBUG] Fetching teams from: ${url}`);

          try {
            const res = await fetch(url, {
              credentials: 'include',
            });

            console.log(`[DEBUG] Response status for ${leagueKey}:`, res.status, res.statusText);

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`[DEBUG] Failed to load teams for league ${leagueKey}:`, {
                status: res.status,
                statusText: res.statusText,
                error: errorText,
              });
              return [];
            }

            const data: YahooTeamsResponse = await res.json();
            console.log(`[DEBUG] Teams data for ${leagueKey}:`, data);

            if (data?.teams && Array.isArray(data.teams)) {
              console.log(`[DEBUG] Found ${data.teams.length} teams for league ${leagueKey}`);
              return data.teams;
            } else {
              console.warn(`[DEBUG] No teams array in response for ${leagueKey}:`, data);
            }
          } catch (e) {
            console.error(`[DEBUG] Exception loading teams for league ${leagueKey}:`, e);
          }
          return [];
        });

        // Wait for all leagues to load
        const teamsArrays = await Promise.all(teamPromises);
        const allTeams = teamsArrays.flat();

        // Debug logging for teams state
        console.log('=== TEAMS STATE DEBUG ===');
        console.log('Teams array length:', allTeams.length);
        console.log('Full teams array:', allTeams);
        if (allTeams.length > 0 && allTeams[0]) {
          const firstTeam = allTeams[0];
          console.log('First team:', firstTeam);
          console.log('Available keys:', Object.keys(firstTeam));
          console.log('First team name:', firstTeam.name);
          console.log('First team team_key:', firstTeam.team_key);
        }

        setTeams(allTeams);
      } catch (e) {
        console.error('Failed to load teams:', e);
      }
    };

    loadAllTeams();
  }, [isConnected, leagues, API_BASE]);

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
      // Extract league key from team key (format: "XXX.l.YYYYY.t.ZZZ")
      const parts = teamKey.split('.t.');
      if (parts.length !== 2) {
        console.error('Invalid team key format:', teamKey);
        return;
      }
      const leagueKey = parts[0];

      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey }),
      });

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
        console.error('Failed to save team selection, status:', res.status);
      }
    } catch (e) {
      console.error('Failed to save team:', e);
    }
  };

  // ===== DERIVED STATE =====

  const selectedTeamName =
    teams.find((t) => t.team_key === selectedTeam)?.name || 'Select Your Team';

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              disabled={teams.length === 0}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-xs font-medium shadow-sm disabled:opacity-50 min-w-[180px]"
            >
              <span className="flex-1 text-left truncate">
                {teams.length === 0 ? 'Loading teams...' : selectedTeamName}
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

            {teamsDropdownOpen && teams.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {teams.map((team) => (
                  <button
                    key={team.team_key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTeam(team.team_key);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{team.name}</div>
                      <div className="text-xs text-gray-500 truncate">{team.team_key}</div>
                    </div>
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
