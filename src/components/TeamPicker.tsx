'use client';

import { useEffect, useState } from 'react';

interface Team {
  team_key: string;
  name: string;
}

export default function TeamPicker() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagueKey, setLeagueKey] = useState<string | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  useEffect(() => {
    // Load current selection
    const loadSelection = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/session/selection`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSelectedTeam(data.selection?.teamKey || data.selection?.active_team_key || undefined);
          setLeagueKey(data.selection?.leagueKey || undefined);
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
      }
    };
    loadSelection();
  }, []);

  useEffect(() => {
    if (!leagueKey) return;
    setLoading(true);
    (async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/teams?format=json`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams || []);
        }
      } catch (e) {
        console.error('Failed to load teams:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [leagueKey]);

  const handleSelect = async (teamKey: string) => {
    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamKey, leagueKey }),
      });
      if (res.ok) {
        setSelectedTeam(teamKey);
        setShowPicker(false);
      }
    } catch (e) {
      console.error('Failed to save selection:', e);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{selectedTeam ? 'Team Selected' : 'Choose Your Team'}</div>
          <div className="text-sm opacity-80">
            {selectedTeam ? (
              <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                {selectedTeam}
              </span>
            ) : (
              'Select a team to see your roster and get personalized tools.'
            )}
          </div>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {selectedTeam ? 'Change Team' : 'Select Team'}
        </button>
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Your Team</h3>
            {loading ? (
              <div className="text-center py-8">Loading teams...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <button
                    key={team.team_key}
                    onClick={() => handleSelect(team.team_key)}
                    className="w-full text-left px-4 py-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {team.name} <span className="opacity-60 text-xs">({team.team_key})</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowPicker(false)}
              className="mt-4 w-full px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
