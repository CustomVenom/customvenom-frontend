'use client';

import { useEffect, useState } from 'react';

interface Team {
  team_key: string;
  name: string;
}

export default function TeamSelector() {
  const [hasSession, setHasSession] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    fetch(`${API_BASE}/yahoo/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          setHasSession(true);
          void loadTeams();
        }
      })
      .catch(() => setHasSession(false));
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      const leaguesRes = await fetch(`${API_BASE}/yahoo/leagues`, { credentials: 'include' });
      if (!leaguesRes.ok) {
        setLoading(false);
        return;
      }
      const leaguesData = await leaguesRes.json();
      const leagueKey: string | undefined = leaguesData.league_keys?.[0];
      if (!leagueKey) {
        setLoading(false);
        return;
      }
      const teamsRes = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/teams?format=json`, {
        credentials: 'include',
      });
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const teamList: Team[] = ((teamsData.teams as unknown[]) || []).map((raw) => {
          const t = raw as Partial<Team> & { team_key?: string; name?: string };
          return {
            team_key: t.team_key || '',
            name: t.name || 'Unknown Team',
          };
        });
        setTeams(teamList);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (teamKey: string) => {
    setSelectedTeam(teamKey);
    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active_team_key: teamKey }),
      });
    } catch (err) {
      console.error('Failed to save team selection:', err);
    }
  };

  if (!hasSession) return null;

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="text-sm opacity-60">Loading teams...</div>
      </div>
    );
  }

  if (teams.length === 0) return null;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label className="block text-sm font-medium mb-2">Select Your Team</label>
      <select
        value={selectedTeam || ''}
        onChange={(e) => handleSelectTeam(e.target.value)}
        className="w-full px-3 py-2 border rounded-md bg-white"
      >
        <option value="">Choose a team...</option>
        {teams.map((team) => (
          <option key={team.team_key} value={team.team_key}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}
