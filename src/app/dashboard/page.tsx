'use client';

import { useState, useEffect } from 'react';
import { useSelectedLeague } from '@/lib/selection';

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

interface YahooMe {
  guid?: string;
  auth_required?: boolean;
  error?: string;
}

interface YahooLeagues {
  league_keys?: string[];
  auth_required?: boolean;
  error?: string;
}

export default function DashboardPage() {
  const { league_key, setSelection } = useSelectedLeague();
  const [me, setMe] = useState<YahooMe | null>(null);
  const [leagues, setLeagues] = useState<YahooLeagues | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  // Load user + leagues on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, leaguesRes] = await Promise.all([
          fetch(`${API_BASE}/yahoo/me`, { credentials: 'include' }),
          fetch(`${API_BASE}/yahoo/leagues?format=json`, { credentials: 'include' }),
        ]);
        if (meRes.ok) setMe(await meRes.json());
        if (leaguesRes.ok) setLeagues(await leaguesRes.json());
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  // Load saved team selection on mount
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/session/selection`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.active_team_key) {
            setSelectedTeam(data.active_team_key);
          }
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
      }
    };
    loadSelection();
  }, [API_BASE]);

  // Load teams when league selected
  useEffect(() => {
    if (!league_key) {
      setTeams([]);
      setSelectedTeam(null);
      setRoster([]);
      return;
    }

    const loadTeams = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/yahoo/leagues/${league_key}/teams?format=json`,
          { credentials: 'include' },
        );
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams || []);
        }
      } catch (e) {
        console.error('Failed to load teams:', e);
      }
    };

    loadTeams();
  }, [league_key, API_BASE]);

  // Load roster when team selected
  useEffect(() => {
    if (!selectedTeam) {
      setRoster([]);
      return;
    }

    const loadRoster = async () => {
      try {
        const res = await fetch(`${API_BASE}/yahoo/team/${selectedTeam}/roster`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setRoster(data.roster || []);
        }
      } catch (e) {
        console.error('Failed to load roster:', e);
      }
    };

    loadRoster();
  }, [selectedTeam, API_BASE]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const handleSelectTeam = async (teamKey: string) => {
    try {
      await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey: league_key }),
      });
      setSelectedTeam(teamKey);
      setTeamsDropdownOpen(false);
      window.dispatchEvent(
        new CustomEvent('team-selected', {
          detail: { teamKey, leagueKey: league_key },
        }),
      );
    } catch (e) {
      console.error('Failed to save team:', e);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-team-selector]')) {
      setTeamsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (teamsDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [teamsDropdownOpen]);

  const selectedTeamName =
    teams.find((t) => t.team_key === selectedTeam)?.name || 'Select Your Team';

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP-RIGHT BUTTONS */}
      <div className="fixed top-4 right-6 z-50 flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Leagues'}
        </button>

        {/* Team selector dropdown */}
        {league_key && (
          <div className="relative" data-team-selector>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTeamsDropdownOpen(!teamsDropdownOpen);
              }}
              disabled={teams.length === 0}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50 min-w-[180px]"
            >
              <span className="flex-1 text-left truncate">{selectedTeamName}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${
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
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-[100]">
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
                        className="w-8 h-8 rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{team.name}</div>
                      <div className="text-xs text-gray-500 truncate">{team.team_key}</div>
                    </div>
                    {selectedTeam === team.team_key && (
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
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
      <div className="p-6 pt-20 max-w-6xl mx-auto">
        {/* Connection status */}
        {me?.guid && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block mb-6">
            Connected — GUID: {me.guid} · Leagues: {leagues?.league_keys?.length || 0}
          </div>
        )}

        {/* Leagues list */}
        {leagues?.league_keys && leagues.league_keys.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Leagues</h2>
            <ul className="space-y-2 max-w-2xl">
              {leagues.league_keys.map((key: string) => (
                <li key={key}>
                  <button
                    onClick={() => setSelection({ league_key: key })}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      league_key === key
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{key}</div>
                    {league_key === key && (
                      <div className="text-xs text-blue-600 mt-1">✓ Selected</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No leagues found for this account.</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}