'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/badge';
import type { PlayerListItem } from '@/types/players';

type Position = 'All' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
type ScoringFormat = 'standard' | 'half_ppr' | 'full_ppr';

/**
 * Calculate current NFL week
 */
function getCurrentNFLWeek(): number {
  const now = new Date();
  const year = now.getFullYear();
  const startOfSeason = new Date(year, 8, 1); // Sept 1
  const weeksSinceStart = Math.floor(
    (now.getTime() - startOfSeason.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return Math.max(1, Math.min(18, weeksSinceStart + 1));
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerListItem[]>([]);
  const [position, setPosition] = useState<Position>('All');
  const [sortBy, setSortBy] = useState<'projected' | 'floor' | 'ceiling'>('projected');
  const [week, setWeek] = useState<number>(getCurrentNFLWeek());
  const [scoringFormat, setScoringFormat] = useState<ScoringFormat>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state before new fetch - acceptable pattern for async operations
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

    // Build query params
    const year = new Date().getFullYear();
    const weekParam = `${year}-${String(week).padStart(2, '0')}`;
    const params = new URLSearchParams({
      week: weekParam,
      format: scoringFormat,
    });

    fetch(`/api/projections?${params}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load projections: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPlayers(data.projections || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load players');
        setLoading(false);
      });
  }, [week, scoringFormat]);

  const filteredPlayers = players
    .filter((p) => position === 'All' || p.position === position)
    .sort((a, b) => {
      if (sortBy === 'projected') return (b.p50 || 0) - (a.p50 || 0);
      if (sortBy === 'floor') return (b.p10 || 0) - (a.p10 || 0);
      if (sortBy === 'ceiling') return (b.p90 || 0) - (a.p90 || 0);
      return 0;
    });

  if (loading) return <div className="p-4">Loading...</div>;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 pb-20 md:pb-4">
        <div className="bg-negative/20 border border-negative rounded-lg p-4">
          <p className="text-negative font-semibold">Error</p>
          <p className="text-sm text-text-secondary mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20 md:pb-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Players</h1>
        <div className="flex gap-2">
          <select
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value))}
            className="bg-background-secondary border border-border-default rounded-md px-3 py-2 text-text-primary text-sm"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
          <select
            value={scoringFormat}
            onChange={(e) => setScoringFormat(e.target.value as ScoringFormat)}
            className="bg-background-secondary border border-border-default rounded-md px-3 py-2 text-text-primary text-sm"
            title="Scoring Format"
          >
            <option value="standard">Standard</option>
            <option value="half_ppr">Half PPR</option>
            <option value="full_ppr">Full PPR</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search players..."
          className="w-full bg-background-secondary border border-border-default rounded-lg px-4 py-2 text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      {/* Position Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as Position[]).map((pos) => (
          <button
            key={pos}
            onClick={() => setPosition(pos)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              position === pos
                ? 'bg-venom-primary text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4 text-sm">
        <span className="text-text-secondary">Sort by:</span>
        {(['projected', 'floor', 'ceiling'] as const).map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-3 py-1 rounded-md capitalize ${
              sortBy === sort
                ? 'text-venom-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {sort}
          </button>
        ))}
      </div>

      {/* Players Table */}
      <Table>
        <THead>
          <Tr>
            <Th>Player</Th>
            <Th>Team</Th>
            <Th>Opp</Th>
            <Th>Proj</Th>
            <Th>Floor</Th>
            <Th>Ceil</Th>
            <Th></Th>
          </Tr>
        </THead>
        <TBody>
          {filteredPlayers.slice(0, 50).map((player) => (
            <Tr key={player.player_id}>
              <Td>
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-xs text-text-tertiary">{player.position}</div>
                </div>
              </Td>
              <Td>{player.team}</Td>
              <Td>{player.opponent || 'BYE'}</Td>
              <Td>
                <span className="stat-number">{player.p50?.toFixed(1) || '-'}</span>
              </Td>
              <Td className="text-text-secondary">{player.p10?.toFixed(1) || '-'}</Td>
              <Td className="text-text-secondary">{player.p90?.toFixed(1) || '-'}</Td>
              <Td>
                {player.reasons && player.reasons.length > 0 && (
                  <div className="flex gap-1">
                    {player.reasons.slice(0, 2).map((reason: string, i: number) => (
                      <Badge key={i} variant="default">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
