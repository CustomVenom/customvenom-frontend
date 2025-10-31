'use client';

import { useState, useEffect } from 'react';
import type { PlayerTracking } from '@/types/player-tracking';

interface Props {
  leagueKey?: string;
  week?: string;
}

export function WeeklyTrackingTable({ leagueKey, week = '2025-06' }: Props) {
  const [players, setPlayers] = useState<PlayerTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchTracking = async () => {
      setLoading(true);
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const url = leagueKey
          ? `${API_BASE}/api/tracking/week/${week}?league=${leagueKey}`
          : `${API_BASE}/api/tracking/week/${week}`;

        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) throw new Error(`Tracking failed: ${res.status}`);

        const data = await res.json();
        setPlayers(data.players);
      } catch (e) {
        console.error('Failed to fetch tracking:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [leagueKey, week]);

  const filteredPlayers =
    positionFilter === 'ALL' ? players : players.filter((p) => p.position === positionFilter);

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Tracking</h3>
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        <div className="flex gap-2">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1 text-sm rounded ${
                positionFilter === pos
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Player</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Pos</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Projected</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Actual</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPlayers.map((player) => (
              <tr key={player.player_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{player.player_name}</div>
                  <div className="text-xs text-gray-500">{player.team}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                    {player.position}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {player.projected_points.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {player.actual_points !== null ? player.actual_points.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {player.variance !== null ? (
                    <span className={player.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {player.variance >= 0 ? '+' : ''}
                      {player.variance.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading ? (
        <p className="text-xs text-gray-500">Loading tracking data...</p>
      ) : players.length > 0 ? (
        <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleString()}</p>
      ) : null}
    </div>
  );
}
