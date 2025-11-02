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
    console.log('[BUTTON STATE DEBUG]', {
      teamsLength: teams.length,
      myTeamsCount,
      showAllTeams,
      filteredTeamsLength: filteredTeams.length,
      buttonDisabled: filteredTeams.length === 0,
      isConnected,
      mounted,
    });
  }, [teams.length, filteredTeams.length, showAllTeams, myTeamsCount, isConnected, mounted]);

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
        const allTeams: Team[] = [];
        const leagueKeys = leagues.league_keys;

        // TypeScript null check
        if (!leagueKeys || leagueKeys.length === 0) {
          console.log('[DEBUG] No league keys found');
          return;
        }

        console.log('[DEBUG] Starting to load teams from', leagueKeys.length, 'leagues');

        // Fetch teams for each league individually (more reliable than bulk endpoint)
        for (const leagueKey of leagueKeys) {
          if (typeof leagueKey !== 'string') {
            console.warn('[DEBUG] Skipping invalid league key:', leagueKey);
            continue;
          }

          try {
            console.log('[DEBUG] Fetching teams for league:', leagueKey);

            const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/teams?format=json`, {
              credentials: 'include',
            });

            if (!res.ok) {
              console.error(
                '[DEBUG] Failed to fetch teams for',
                leagueKey,
                '- status:',
                res.status,
              );
              continue;
            }

            const data = await res.json();

            if (data?.teams && Array.isArray(data.teams)) {
              // Tag each team with its league_key
              const taggedTeams = data.teams.map(
                (team: {
                  team_key: string;
                  name: string;
                  team_logos?: Array<{ url: string }>;
                  is_owner?: boolean;
                }) => ({
                  team_key: team.team_key, // Yahoo API provides team_key directly
                  name: team.name,
                  team_logos: team.team_logos,
                  league_key: leagueKey, // Tag the team with which league it came from
                  is_owner: team.is_owner ?? false,
                }),
              );

              console.log('[DEBUG] Tagged teams from', leagueKey, ':', taggedTeams.length, 'teams');
              allTeams.push(...taggedTeams);
            } else {
              console.warn('[DEBUG] No teams array in response for', leagueKey, ':', data);
            }
          } catch (leagueError) {
            console.error('[DEBUG] Error fetching teams for', leagueKey, ':', leagueError);
            // Continue with next league even if one fails
          }
        }

        console.log('[DEBUG] Total teams loaded:', allTeams.length);
        if (allTeams.length > 0) {
          console.log(
            '[DEBUG] Teams by league:',
            allTeams.reduce(
              (acc, team) => {
                acc[team.league_key] = (acc[team.league_key] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            ),
          );
        } else {
          console.warn('[DEBUG] WARNING: No teams loaded from any league!');
        }
        console.log('[DEBUG] All teams:', allTeams);

        setTeams(allTeams);
      } catch (e) {
        console.error('[DEBUG] Failed to load teams:', e);
        setTeams([]);
      }
    };

    loadAllTeams();
  }, [isConnected, leagues?.league_keys, API_BASE]);

  // ===== EFFECT: Click outside to close dropdown =====
  useEffect(() => {
    if (!teamsDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const selector = target.closest('[data-team-selector]');
      if (!selector) {
        console.log('[CLICK OUTSIDE DEBUG] Closing dropdown');
        setTeamsDropdownOpen(false);
      } else {
        console.log('[CLICK OUTSIDE DEBUG] Click inside selector, keeping open');
      }
    };

    // Use capture phase to ensure we catch clicks before other handlers
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
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

      // Find the team object to get its tagged league_key
      const team = teams.find((t) => t.team_key === teamKey);

      if (!team) {
        console.error('[handleSelectTeam] Team not found:', teamKey);
        return;
      }

      const leagueKey = team.league_key; // Use the tagged league_key
      console.log('[handleSelectTeam] Using tagged leagueKey:', leagueKey);
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
                e.preventDefault();
                e.stopPropagation();
                console.log('[BUTTON DEBUG] Button clicked!', {
                  filteredTeamsLength: filteredTeams.length,
                  teamsLength: teams.length,
                  teamsDropdownOpen,
                });
                setTeamsDropdownOpen((prev) => {
                  console.log('[BUTTON DEBUG] Setting dropdown to:', !prev);
                  return !prev;
                });
              }}
              disabled={filteredTeams.length === 0}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-xs font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] cursor-pointer"
              aria-label="Select team"
              type="button"
            >
              <span className="flex-1 text-left truncate">
                {!mounted
                  ? 'Loading...'
                  : filteredTeams.length === 0
                    ? 'Select Your Team'
                    : selectedTeamName}
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

        {/* Call to action - View Roster */}
        {selectedTeam && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Ready to view your roster?
            </h2>
            <p className="text-gray-600 mb-6">
              You've selected <strong>{selectedTeamName}</strong>. View your full roster with
              projections.
            </p>
            <a
              href="/league/roster"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors"
            >
              View Your Roster →
            </a>
          </div>
        )}

        {/* No team selected state */}
        {!selectedTeam && isConnected && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Select a team above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
