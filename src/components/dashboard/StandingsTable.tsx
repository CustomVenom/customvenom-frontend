'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/Table';

interface Standing {
  team_key: string;
  team_id: string;
  name: string;
  rank: number;
  outcome_totals: {
    wins: number;
    losses: number;
    ties: number;
    percentage: string;
  };
  points_for: string;
  points_against: string;
}

interface StandingsResponse {
  ok: boolean;
  standings: Standing[];
  request_id?: string;
}

export function StandingsTable({ leagueKey }: { leagueKey: string | null }) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  useEffect(() => {
    if (!leagueKey) {
      setLoading(false);
      return;
    }

    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/standings?format=json`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch standings: ${res.status}`);
        }

        const data: StandingsResponse = await res.json();
        if (data.ok && data.standings) {
          setStandings(data.standings);
        } else {
          setStandings([]);
        }
      } catch (err) {
        logger.error('[StandingsTable] Error fetching standings', {
          error: err instanceof Error ? err.message : String(err),
        });
        setError(err instanceof Error ? err.message : 'Failed to load standings');
        setStandings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [leagueKey, API_BASE]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">Error: {error}</div>;
  }

  if (standings.length === 0) {
    return <div className="text-sm text-gray-400">No standings available</div>;
  }

  const playoffLine = 4; // Top 4 make playoffs

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-full inline-block">
        <Table className="min-w-full">
          <THead>
            <Tr>
              <Th className="whitespace-nowrap">Rank</Th>
              <Th className="whitespace-nowrap min-w-[120px]">Team</Th>
              <Th className="whitespace-nowrap">W-L-T</Th>
              <Th className="whitespace-nowrap">PF</Th>
              <Th className="whitespace-nowrap">PA</Th>
            </Tr>
          </THead>
          <TBody>
            {standings.map((team, idx) => (
              <Tr
                key={team.team_key}
                className={idx < playoffLine ? 'border-l-2 border-l-green-500' : ''}
              >
                <Td className="font-semibold whitespace-nowrap">{team.rank}</Td>
                <Td className="font-medium min-w-[120px]">{team.name}</Td>
                <Td className="whitespace-nowrap">
                  {team.outcome_totals.wins}-{team.outcome_totals.losses}
                  {team.outcome_totals.ties > 0 ? `-${team.outcome_totals.ties}` : ''}
                </Td>
                <Td className="whitespace-nowrap">{parseFloat(team.points_for).toFixed(1)}</Td>
                <Td className="whitespace-nowrap">{parseFloat(team.points_against).toFixed(1)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
