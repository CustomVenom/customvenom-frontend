'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 12; // 12 teams per page

  useEffect(() => {
    if (!leagueKey) {
      setLoading(false);
      return;
    }

    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use proxy route instead of direct API call
        const res = await fetch(`/api/yahoo/leagues/${leagueKey}/standings?format=json`, {
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
  }, [leagueKey]);

  // Pagination logic
  const totalPages = Math.ceil(standings.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedStandings = useMemo(() => {
    return standings.slice(startIndex, endIndex);
  }, [standings, startIndex, endIndex]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

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
    <div className="space-y-3">
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
              {paginatedStandings.map((team, idx) => {
                const globalIdx = startIndex + idx;
                return (
                  <Tr
                    key={team.team_key}
                    className={globalIdx < playoffLine ? 'border-l-2 border-l-green-500' : ''}
                  >
                    <Td className="font-semibold whitespace-nowrap">{team.rank}</Td>
                    <Td className="font-medium min-w-[120px]">{team.name}</Td>
                    <Td className="whitespace-nowrap">
                      {team.outcome_totals.wins}-{team.outcome_totals.losses}
                      {team.outcome_totals.ties > 0 ? `-${team.outcome_totals.ties}` : ''}
                    </Td>
                    <Td className="whitespace-nowrap">{parseFloat(team.points_for).toFixed(1)}</Td>
                    <Td className="whitespace-nowrap">
                      {parseFloat(team.points_against).toFixed(1)}
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - only show if more than 12 teams */}
      {standings.length > 12 && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, standings.length)} of {standings.length}{' '}
            teams
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
