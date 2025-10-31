'use client';

import { useState, useEffect } from 'react';
import { useYahooApi } from '@/hooks/useYahooApi';
import { useSelectedLeague } from '@/hooks/useSelectedLeague';

interface YahooTeam {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
}

export function TeamSelector() {
  const { league } = useSelectedLeague();
  const { loading, error, fetchTeams } = useYahooApi();
  const [teams, setTeams] = useState<YahooTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load current selection on mount
  useEffect(() => {
    const loadCurrentSelection = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/session/selection`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedTeam(data.selection?.teamKey || null);
        }
      } catch (e) {
        console.error('Failed to load current selection:', e);
      }
    };
    loadCurrentSelection();
  }, []);

  // Fetch teams when league changes
  useEffect(() => {
    if (!league) {
      setTeams([]);
      return;
    }

    const loadTeams = async () => {
      try {
        const teamsData = await fetchTeams(league);
        setTeams(teamsData);
      } catch (e) {
        console.error('Failed to load teams:', e);
      }
    };

    loadTeams();
  }, [league, fetchTeams]);

  const handleTeamSelect = async (teamKey: string, leagueKey: string) => {
    setSelectedTeam(teamKey);
    setIsOpen(false);

    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teamKey,
          leagueKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save selection: ${res.status}`);
      }

      console.log('Team selection saved:', teamKey);
    } catch (e) {
      console.error('Failed to save team selection:', e);
      // Revert selection on error
      const current = await fetch(
        `${process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com'}/api/session/selection`,
        { credentials: 'include' },
      );
      if (current.ok) {
        const data = await current.json();
        setSelectedTeam(data.selection?.teamKey || null);
      }
    }
  };

  if (!league) {
    return (
      <div className="text-sm text-gray-500">
        Select a league to choose a team
      </div>
    );
  }

  const selectedTeamData = teams.find((t) => t.team_key === selectedTeam);
  const displayName = selectedTeamData?.name || 'Select Team';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || teams.length === 0}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
      >
        <span>{loading ? 'Loading teams...' : displayName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {error ? (
              <div className="p-3 text-sm text-red-600">
                Error loading teams: {error}
              </div>
            ) : teams.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No teams available
              </div>
            ) : (
              <ul className="py-1">
                {teams.map((team) => (
                  <li key={team.team_key}>
                    <button
                      onClick={() => handleTeamSelect(team.team_key, league)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                        selectedTeam === team.team_key ? 'bg-blue-50 font-medium' : ''
                      }`}
                    >
                      {team.team_logos?.[0]?.url && (
                        <img
                          src={team.team_logos[0].url}
                          alt={team.name}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span className="flex-1">{team.name}</span>
                      {selectedTeam === team.team_key && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
