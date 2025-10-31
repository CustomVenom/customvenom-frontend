'use client';

import { useState, useEffect } from 'react';
import { useSelectedLeague } from '@/lib/selection';

interface Team {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
}

export default function TeamSelector() {
  const { league_key } = useSelectedLeague();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';

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

  // Load teams when league changes
  useEffect(() => {
    if (!league_key) {
      setTeams([]);
      return;
    }

    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/yahoo/leagues/${league_key}/teams?format=json`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to load teams: ${res.status}`);
        }

        const data = await res.json();
        setTeams(data.teams || []);
      } catch (e: unknown) {
        console.error('Failed to load teams:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [league_key, API_BASE]);

  const handleSelectTeam = async (teamKey: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey: league_key }),
      });

      if (res.ok) {
        setSelectedTeam(teamKey);
        setIsOpen(false);
        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent('team-selected', {
            detail: { teamKey, leagueKey: league_key },
          }),
        );
      } else {
        throw new Error('Failed to save selection');
      }
    } catch (e: unknown) {
      console.error('Failed to save team selection:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-team-selector]')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!league_key) {
    return (
      <div className="text-sm text-gray-500 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
        Select a league first
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 px-4 py-2 border border-red-200 rounded-lg bg-red-50">
        Error: {error}
      </div>
    );
  }

  const selectedTeamName =
    teams.find((t) => t.team_key === selectedTeam)?.name || 'Select Your Team';

  return (
    <div className="relative inline-block" data-team-selector>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || teams.length === 0}
      >
        <span className="flex-1 text-left truncate text-sm">
          {loading ? 'Loading teams...' : selectedTeamName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && teams.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.team_key}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectTeam(team.team_key);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                selectedTeam === team.team_key ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              {team.team_logos?.[0]?.url && (
                <img src={team.team_logos[0].url} alt="" className="w-10 h-10 rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{team.name}</div>
                <div className="text-xs text-gray-500 truncate">{team.team_key}</div>
              </div>
              {selectedTeam === team.team_key && (
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
  );
}
