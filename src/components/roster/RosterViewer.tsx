'use client';

import { useState, useEffect } from 'react';
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
  const { loading, error, fetchLeagues, fetchTeams } = useYahooApi();
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [_selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [teams, setTeams] = useState<YahooTeam[]>([]);
  const [_selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [view, setView] = useState<'leagues' | 'teams' | 'roster'>('leagues');

  // Load leagues on mount
  useEffect(() => {
    fetchLeagues().then(setLeagues).catch(console.error);
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Projected
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roster.map((player) => (
                    <tr key={player.player_key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{player.name.full}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          {player.display_position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{player.editorial_team_abbr}</td>
                      <td className="px-4 py-3">
                        {player.projected_points !== null && player.projected_points !== undefined ? (
                          <span className="font-semibold text-gray-900">
                            {player.projected_points.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {player.mapped ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                            Mapped
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                            Unmapped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  );
}
