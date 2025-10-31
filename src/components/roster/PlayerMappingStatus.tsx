'use client';

import { useState, useEffect } from 'react';
import type { MappedPlayer, MappingStats } from '@/types/player-mapping';

interface Props {
  roster: Array<{
    player_key: string;
    name: { full: string };
    display_position: string;
    editorial_team_abbr: string;
  }>;
}

export function PlayerMappingStatus({ roster }: Props) {
  const [mappedPlayers, setMappedPlayers] = useState<MappedPlayer[]>([]);
  const [stats, setStats] = useState<MappingStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncPlayers = async () => {
      if (roster.length === 0) return;

      setLoading(true);
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/players/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ yahoo_roster: roster }),
        });

        if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

        const data = await res.json();
        setMappedPlayers(data.mapped_players);
        setStats(data.stats);
      } catch (e) {
        console.error('Failed to sync players:', e);
      } finally {
        setLoading(false);
      }
    };

    syncPlayers();
  }, [roster]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Player Mapping</h3>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Player Mapping</h3>
        <div className="text-sm text-gray-600">
          {stats.mapped}/{stats.total} mapped
        </div>
      </div>
      {/* Stats badges */}
      <div className="flex gap-2">
        <div className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
          ✓ {stats.mapped} Mapped
        </div>
        {stats.low_confidence > 0 && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
            ⚠ {stats.low_confidence} Low Confidence
          </div>
        )}
        {stats.unmapped > 0 && (
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
            ✕ {stats.unmapped} Unmapped
          </div>
        )}
      </div>
      {/* Player list */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Player</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mappedPlayers.map((player) => (
              <tr key={player.yahoo_player_id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{player.yahoo_name}</div>
                  <div className="text-xs text-gray-500">
                    {player.position} • {player.team}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {player.status === 'mapped' && (
                    <span className="text-green-600">✓ Mapped</span>
                  )}
                  {player.status === 'low_confidence' && (
                    <span className="text-yellow-600">⚠ Low Conf</span>
                  )}
                  {player.status === 'unmapped' && (
                    <span className="text-red-600">✕ Unmapped</span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {player.nflverse_id ? `${Math.round(player.confidence * 100)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

