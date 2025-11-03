'use client';

import { ConnectLeagueButton } from '@/components/ConnectLeagueButton';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RosterViewer } from '@/components/roster/RosterViewer';
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
  const [mounted, setMounted] = useState(false);
  // Removed showAllTeams toggle - we only show user-owned teams

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
  // Show only user-owned teams in the dropdown
  const ownedTeams = teams.filter((t) => t.is_owner === true);
  const displayTeams = ownedTeams.length > 0 ? ownedTeams : teams; // Fallback to all teams if ownership detection fails

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
          return;
        }

        // Fetch teams for each league individually (more reliable than bulk endpoint)
        for (const leagueKey of leagueKeys) {
          if (typeof leagueKey !== 'string') {
            continue;
          }

          try {
            const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/teams?format=json`, {
              credentials: 'include',
            });

            if (!res.ok) {
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
                }) => {
                  return {
                    team_key: team.team_key, // Yahoo API provides team_key directly
                    name: team.name,
                    team_logos: team.team_logos,
                    league_key: leagueKey, // Tag the team with which league it came from
                    is_owner: team.is_owner ?? false,
                  };
                },
              );

              allTeams.push(...taggedTeams);
            }
          } catch (leagueError) {
            // Continue with next league even if one fails
            console.error('Error fetching teams for league:', leagueError);
          }
        }

        setTeams(allTeams);
      } catch (e) {
        console.error('Failed to load teams:', e);
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
        setTeamsDropdownOpen(false);
      }
    };

    // Use capture phase to ensure we catch clicks before other handlers
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [teamsDropdownOpen]);

  // ===== HANDLERS =====

  const handleSelectTeam = async (teamKey: string) => {
    try {
      // Find the team object to get its tagged league_key
      const team = teams.find((t) => t.team_key === teamKey);

      if (!team) {
        console.error('[handleSelectTeam] Team not found:', teamKey);
        return;
      }

      // Use the league_key we tagged when fetching teams
      // This is the correct league the team was fetched from
      const leagueKey = team.league_key;
      console.log('[handleSelectTeam]', { teamKey, leagueKey, teamName: team.name });

      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey }),
      });

      if (res.ok) {
        setSelectedTeam(teamKey);
        // Don't call setSelection - it makes a redundant POST. The direct POST above already saved the selection.
        // The selection context will sync from the server on next fetch.
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

  // ===== HELPER: Get league name from league_key =====
  const getLeagueName = (leagueKey: string): string => {
    // Simple mapping for now - could be enhanced to fetch from API
    if (leagueKey === '461.l.274391') return 'Quest For Sacco';
    if (leagueKey === '461.l.728197') return 'Beer Drinkers';
    // Fallback: extract league ID from key
    const match = leagueKey.match(/\.l\.(\d+)/);
    return match ? `League ${match[1]}` : leagueKey;
  };

  // ===== DERIVED STATE =====

  // Only compute selectedTeamName when teams are loaded to prevent hydration mismatch
  const selectedTeamObj =
    selectedTeam && teams.length > 0 ? teams.find((t) => t.team_key === selectedTeam) : null;
  const selectedTeamName = selectedTeamObj?.name || 'Select Your Team';

  // ===== RENDER =====

  // Prevent hydration mismatch by showing loading state until client-side mounted
  if (!mounted || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-field-900 dashboard-hub scale-pattern">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // ===== STATE 1: NOT CONNECTED =====
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-field-900 dashboard-hub scale-pattern">
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-100">
                Connect Your Fantasy League
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto">
                Get personalized AI-powered projections, lineup recommendations, and waiver wire
                insights for your team.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <ConnectLeagueButton />
            </div>

            <div className="pt-8 max-w-md mx-auto">
              <div className="rounded-lg border border-field-600 bg-field-800 p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-lg text-gray-100">What you'll get:</h3>
                <ul className="space-y-3 text-left text-sm text-gray-400">
                  <li className="flex items-start">
                    <span className="text-venom-500 mr-2 mt-0.5">✓</span>
                    <span>AI-powered projections for your roster</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-venom-500 mr-2 mt-0.5">✓</span>
                    <span>Start/Sit recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-venom-500 mr-2 mt-0.5">✓</span>
                    <span>FAAB budget optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-venom-500 mr-2 mt-0.5">✓</span>
                    <span>Waiver wire analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STATE 2: CONNECTED BUT NO TEAM SELECTED =====
  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-field-900 dashboard-hub scale-pattern">
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-100">Dashboard</h1>
                <p className="text-gray-400 mt-1">Select your team to continue</p>
              </div>
              {/* Team selector dropdown */}
              <div className="relative" data-team-selector>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTeamsDropdownOpen((prev) => !prev);
                  }}
                  disabled={displayTeams.length === 0}
                  className="px-3 py-1.5 bg-field-800 border border-field-600 rounded-md hover:bg-field-700 hover:border-venom-500/50 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] cursor-pointer text-gray-100 transition-colors"
                  aria-label="Select team"
                  type="button"
                >
                  {selectedTeamObj?.team_logos?.[0]?.url && (
                    <img
                      src={selectedTeamObj.team_logos[0].url}
                      alt=""
                      className="w-6 h-6 rounded shrink-0"
                    />
                  )}
                  <span className="flex-1 text-left truncate text-gray-100">
                    {displayTeams.length === 0
                      ? 'Select Your Team'
                      : selectedTeamName || 'Select Your Team'}
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
                  <div className="absolute right-0 mt-2 w-80 bg-field-800 border border-field-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {displayTeams.map((team) => (
                      <button
                        key={team.team_key}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTeam(team.team_key);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-field-700 text-left transition-colors ${
                          selectedTeam === team.team_key
                            ? 'bg-venom-500/10 border-l-2 border-venom-500'
                            : ''
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
                          <div className="text-sm font-medium truncate text-gray-100">
                            {team.name || `Team ${team.team_key}`}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {team.league_key ? getLeagueName(team.league_key) : 'Unknown League'}
                          </div>
                        </div>
                        {selectedTeam === team.team_key && (
                          <svg
                            className="w-5 h-5 text-venom-500 shrink-0"
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

                    {displayTeams.length === 0 && teams.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-400">
                        No teams available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STATE 3: CONNECTED AND TEAM SELECTED - SHOW HUB =====
  return (
    <div className="min-h-screen bg-field-900 dashboard-hub scale-pattern">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header with Team Selector */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-1">Dashboard</h1>
            </div>
            {/* Team selector dropdown */}
            <div className="relative" data-team-selector>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTeamsDropdownOpen((prev) => !prev);
                }}
                disabled={displayTeams.length === 0}
                className="px-3 py-1.5 bg-field-800 border border-field-600 rounded-md hover:bg-field-700 hover:border-venom-500/50 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] cursor-pointer text-gray-100 transition-colors"
                aria-label="Select team"
                type="button"
              >
                {selectedTeamObj?.team_logos?.[0]?.url && (
                  <img
                    src={selectedTeamObj.team_logos[0].url}
                    alt=""
                    className="w-6 h-6 rounded shrink-0"
                  />
                )}
                <span className="flex-1 text-left truncate text-gray-100">
                  {displayTeams.length === 0
                    ? 'Select Your Team'
                    : selectedTeamName || 'Select Your Team'}
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
                <div className="absolute right-0 mt-2 w-80 bg-field-800 border border-field-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {displayTeams.map((team) => (
                    <button
                      key={team.team_key}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTeam(team.team_key);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-field-700 text-left transition-colors ${
                        selectedTeam === team.team_key
                          ? 'bg-venom-500/10 border-l-2 border-venom-500'
                          : ''
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
                        <div className="text-sm font-medium truncate text-gray-100">
                          {team.name || `Team ${team.team_key}`}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {team.league_key ? getLeagueName(team.league_key) : 'Unknown League'}
                        </div>
                      </div>
                      {selectedTeam === team.team_key && (
                        <svg
                          className="w-5 h-5 text-venom-500 shrink-0"
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

                  {displayTeams.length === 0 && teams.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400">No teams available</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Information-focused grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column (primary info) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Roster Preview */}
              <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Roster</h2>
                <div className="bg-field-900/40 rounded-lg p-2">
                  <RosterViewer />
                </div>
              </div>

              {/* League Standings (placeholder) */}
              <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">League Standings</h2>
                <p className="text-sm text-gray-400">Standings will appear here.</p>
              </div>

              {/* Player News (placeholder) */}
              <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Player News</h2>
                <p className="text-sm text-gray-400">Latest news and injuries will appear here.</p>
              </div>
            </div>

            {/* Right column (quick stats) */}
            <div className="space-y-6">
              {/* Quick Stats */}
              {selectedTeam && (
                <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Team Stats</h2>
                  <DashboardMetrics
                    teamKey={selectedTeam}
                    leagueKey={selectedTeamObj?.league_key || null}
                  />
                </div>
              )}

              {/* Matchup Preview (placeholder) */}
              <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">This Week's Matchup</h2>
                <p className="text-sm text-gray-400">Your matchup preview will appear here.</p>
              </div>

              {/* Quick Links */}
              <div className="bg-field-800/60 border border-field-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Quick Links</h2>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a className="text-venom-400 hover:text-venom-300" href="/dashboard/decisions">
                      Decisions
                    </a>
                  </li>
                  <li>
                    <a className="text-venom-400 hover:text-venom-300" href="/dashboard/start-sit">
                      Start/Sit
                    </a>
                  </li>
                  <li>
                    <a className="text-venom-400 hover:text-venom-300" href="/dashboard/faab">
                      FAAB
                    </a>
                  </li>
                  <li>
                    <a className="text-venom-400 hover:text-venom-300" href="/dashboard/players">
                      Players
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
