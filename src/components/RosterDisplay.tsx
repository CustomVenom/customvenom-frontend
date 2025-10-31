'use client';

import { useEffect, useState } from 'react';

interface Player {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
}

export default function RosterDisplay() {
  const [teamKey, setTeamKey] = useState<string | undefined>(undefined);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelection = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/session/selection`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTeamKey(data.selection?.teamKey || data.selection?.active_team_key || undefined);
        }
      } catch (e) {
        console.error('Failed to load selection:', e);
      }
    };
    loadSelection();
  }, []);

  useEffect(() => {
    if (!teamKey) {
      setRoster([]);
      return;
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/yahoo/roster`, { credentials: 'include' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch roster (${res.status})`);
        }
        const data = await res.json();
        setRoster(data.roster || []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load roster';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamKey]);

  if (!teamKey) return null;

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
        <div className="font-medium">Failed to load roster</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="text-sm opacity-60">No roster data available</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium border-b">
        Your Roster ({roster.length} players)
      </div>
      <div className="divide-y">
        {roster.map((player) => (
          <div
            key={player.player_key}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex-1">
              <div className="font-medium">{player.name.full}</div>
              <div className="text-sm opacity-60">
                {player.display_position} · {player.editorial_team_abbr}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
