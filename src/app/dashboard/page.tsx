'use client';

import { useSelectedLeague } from '@/lib/selection';
import { useEffect, useState } from 'react';
import { NavigationCards } from '@/components/dashboard/NavigationCards';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ConnectLeagueButton } from '@/components/ConnectLeagueButton';

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

  // Only compute selectedTeamName when teams are loaded to prevent hydration mismatch
  const selectedTeamObj =
    selectedTeam && teams.length > 0 ? teams.find((t) => t.team_key === selectedTeam) : null;
  const selectedTeamName = selectedTeamObj?.name || 'Select Your Team';

  // ===== RENDER =====

  // Prevent hydration mismatch by showing loading state until client-side mounted
  if (!mounted || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // ===== STATE 1: NOT CONNECTED =====
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                Connect Your Fantasy League
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Get personalized AI-powered projections, lineup recommendations, and waiver wire insights for your team.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <ConnectLeagueButton />
            </div>

            <div className="pt-8 max-w-md mx-auto">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
                  What you'll get:
                </h3>
                <ul className="space-y-3 text-left text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">✓</span>
                    <span>AI-powered projections for your roster</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">✓</span>
                    <span>Start/Sit recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">✓</span>
                    <span>FAAB budget optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">✓</span>
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
      <div className="container max-w-4xl mx-auto py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Select your team to continue</p>
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
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] cursor-pointer"
                aria-label="Select team"
                type="button"
              >
                <span className="flex-1 text-left truncate text-gray-900 dark:text-gray-100">
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
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {displayTeams.map((team) => (
                    <button
                      key={team.team_key}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTeam(team.team_key);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left ${
                        selectedTeam === team.team_key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      {team.team_logos?.[0]?.url && (
                        <img
                          src={team.team_logos[0].url}
                          alt=""
                          className="w-8 h-8 rounded shrink-0"
                        />
                      )}
                      <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">
                        {team.name || `Team ${team.team_key}`}
                        {team.is_owner && ' ⭐'}
                      </span>
                      {selectedTeam === team.team_key && (
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
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
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No teams available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STATE 3: CONNECTED AND TEAM SELECTED - SHOW HUB =====
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="space-y-8">
        {/* Header with Team Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your fantasy football command center</p>
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
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] cursor-pointer"
              aria-label="Select team"
              type="button"
            >
              <span className="flex-1 text-left truncate text-gray-900 dark:text-gray-100">
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
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {displayTeams.map((team) => (
                  <button
                    key={team.team_key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTeam(team.team_key);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left ${
                      selectedTeam === team.team_key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {team.team_logos?.[0]?.url && (
                      <img
                        src={team.team_logos[0].url}
                        alt=""
                        className="w-8 h-8 rounded shrink-0"
                      />
                    )}
                    <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">
                      {team.name || `Team ${team.team_key}`}
                      {team.is_owner && ' ⭐'}
                    </span>
                    {selectedTeam === team.team_key && (
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
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
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No teams available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Metrics - Only show if team selected */}
        {selectedTeam && (
          <DashboardMetrics
            teamKey={selectedTeam}
            leagueKey={selectedTeamObj?.league_key || null}
          />
        )}

        {/* Navigation Cards - Main Feature */}
        <NavigationCards />
      </div>
    </div>
  );
}
