// React Query hook for league standings with trust headers
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';

interface StandingsResponse {
  standings: Array<{
    rank: number;
    team_name: string;
    wins: number;
    losses: number;
    ties: number;
    points_for: number;
    points_against: number;
    team_key: string;
  }>;
  playoff_line?: number;
}

export function useLeagueStandings(leagueKey: string | null) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || '';

  return useQuery<ApiResponse<StandingsResponse>>({
    queryKey: ['standings', leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/leagues/${leagueKey}/standings`;
      return fetchWithTrust<StandingsResponse>(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      });
    },
    enabled: !!leagueKey && !!apiBase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
