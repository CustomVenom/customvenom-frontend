'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ToolsTabs from '@/components/ToolsTabs';

// Yahoo API types
interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  num_teams: number;
  current_week: number;
  season: string;
  scoring_type: string;
  felo_tier?: string;
}

interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  waiver_priority?: number;
  faab_balance?: string;
  is_owned_by_current_login?: number;
}

interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
  };
  display_position: string;
  editorial_team_abbr: string;
  status?: string;
  injury_note?: string;
}

export default function YahooToolPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [teams, setTeams] = useState<YahooTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [roster, setRoster] = useState<YahooPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';

  // Check if user is connected to Yahoo
  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/yahoo/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Check if we have actual user data (not just a successful response)
        if (data.user && data.user.sub && data.user.email) {
          setIsConnected(true);
          // Auto-fetch leagues when connected
          await fetchLeagues();
        } else {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      console.error('[Yahoo Check]', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      setError(null);
      const response = await fetch(`${apiBase}/yahoo/me/leagues`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }

      const data = await response.json();

      // Parse Yahoo API response
      const leaguesData =
        data.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues || {};
      const leaguesList: YahooLeague[] = [];

      for (let i = 0; i < (leaguesData.count || 0); i++) {
        const leagueWrapper = leaguesData[i.toString()];
        if (leagueWrapper?.league) {
          leaguesList.push(leagueWrapper.league[0]);
        }
      }

      setLeagues(leaguesList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leagues');
      console.error('[Yahoo Leagues Error]', err);
    }
  };

  const fetchTeams = async (leagueKey: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${apiBase}/yahoo/league/${leagueKey}/teams`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();

      // Parse teams from Yahoo API response
      const teamsData = data.fantasy_content?.league?.[1]?.teams || {};
      const teamsList: YahooTeam[] = [];

      for (let i = 0; i < (teamsData.count || 0); i++) {
        const teamWrapper = teamsData[i.toString()];
        if (teamWrapper?.team) {
          const teamInfo: Record<string, unknown> = {};
          teamWrapper.team[0].forEach((item: Record<string, unknown>) => {
            const key = Object.keys(item)[0];
            teamInfo[key] = item[key];
          });
          teamsList.push(teamInfo as unknown as YahooTeam);
        }
      }

      setTeams(teamsList);
      setSelectedLeague(leagueKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      console.error('[Yahoo Teams Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (teamKey: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${apiBase}/yahoo/team/${teamKey}/roster`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roster');
      }

      const data = await response.json();

      // Parse roster from Yahoo API response
      const playersData = data.fantasy_content?.team?.[1]?.roster?.[0]?.players || {};
      const playersList: YahooPlayer[] = [];

      for (let i = 0; i < (playersData.count || 0); i++) {
        const playerWrapper = playersData[i.toString()];
        if (playerWrapper?.player) {
          const playerInfo: Record<string, unknown> = {};
          playerWrapper.player[0].forEach((item: Record<string, unknown>) => {
            const key = Object.keys(item)[0];
            playerInfo[key] = item[key];
          });
          playersList.push(playerInfo as unknown as YahooPlayer);
        }
      }

      setRoster(playersList);
      setSelectedTeam(teamKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roster');
      console.error('[Yahoo Roster Error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isConnected) {
    return (
      <>
        <h1 className="h1">Yahoo Fantasy</h1>
        <ToolsTabs />
        <div className="section">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <h2 className="h2 mb-4">Connect Your Yahoo Fantasy Account</h2>
            <p className="text-muted mb-6">
              Link your Yahoo account to view your leagues, teams, and rosters.
            </p>
            <Link
              href="/api/auth/signin?provider=yahoo"
              className="cv-btn-primary inline-block px-6 py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Connect Yahoo
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!isConnected) {
    return (
      <>
        <h1 className="h1">Yahoo Fantasy</h1>
        <ToolsTabs />
        <div className="section">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <h2 className="h2 mb-4">Connect Your Yahoo Fantasy Account</h2>
            <p className="text-muted mb-6">
              Link your Yahoo account to view your leagues, teams, and rosters.
            </p>
            <Link
              href="/api/auth/signin?provider=yahoo"
              className="cv-btn-primary inline-block px-6 py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Connect Yahoo
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="h1">Yahoo Fantasy</h1>
      <ToolsTabs />

      <div className="section space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓ Connected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="cv-btn-ghost text-sm">
              Refresh
            </button>
            <Link
              href="/api/auth/signout"
              className="cv-btn-ghost text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Sign Out
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Leagues */}
        {leagues.length > 0 && (
          <div>
            <h2 className="h2 mb-4">Your Leagues ({leagues.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {leagues.map((league) => (
                <button
                  key={league.league_key}
                  onClick={() => fetchTeams(league.league_key)}
                  className={`border rounded-lg p-4 text-left transition-colors ${
                    selectedLeague === league.league_key
                      ? 'border-brand-primary dark:border-brand-accent bg-brand-primary/5 dark:bg-brand-accent/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-accent'
                  }`}
                >
                  <div className="font-semibold text-lg mb-1">{league.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {league.num_teams} teams • Week {league.current_week} • {league.season}
                  </div>
                  {league.felo_tier && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Tier: {league.felo_tier}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teams */}
        {teams.length > 0 && selectedLeague && (
          <div>
            <h2 className="h2 mb-4">Teams ({teams.length})</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {teams.map((team) => (
                <button
                  key={team.team_key}
                  onClick={() => fetchRoster(team.team_key)}
                  className={`border rounded-lg p-3 text-left transition-colors ${
                    selectedTeam === team.team_key
                      ? 'border-brand-primary dark:border-brand-accent bg-brand-primary/5 dark:bg-brand-accent/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-accent'
                  }`}
                >
                  <div className="font-medium mb-1 truncate">{team.name}</div>
                  {team.is_owned_by_current_login === 1 && (
                    <div className="text-xs text-brand-primary dark:text-brand-accent mb-1">
                      👤 Your Team
                    </div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {team.faab_balance && `FAAB: $${team.faab_balance}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Roster */}
        {roster.length > 0 && selectedTeam && (
          <div>
            <h2 className="h2 mb-4">Roster ({roster.length} players)</h2>
            <div className="space-y-2">
              {roster.map((player) => (
                <div
                  key={player.player_key}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{player.name.full}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {player.display_position} • {player.editorial_team_abbr}
                      {player.status && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          {player.status}
                          {player.injury_note && ` - ${player.injury_note}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (selectedLeague || selectedTeam) && (
          <div className="text-center py-8">
            <div className="animate-pulse text-muted">Loading...</div>
          </div>
        )}
      </div>
    </>
  );
}
