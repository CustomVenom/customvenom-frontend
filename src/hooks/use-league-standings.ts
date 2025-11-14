// React Query hook for league standings with trust headers
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import { useTypedQuery } from '@/hooks/useTypedQuery';

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

  return useTypedQuery<StandingsResponse>({
    queryKey: ['standings', leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/leagues/${leagueKey}/standings`;
      const result = await fetchWithTrust(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      });
      // Transform to ApiResponse format
      return {
        data: result.data,
        trust: {
          schemaVersion: result.trust.schemaVersion ?? '',
          lastRefresh: result.trust.lastRefresh ?? '',
          requestId: result.trust.requestId ?? '',
          stale: result.trust.stale ?? undefined,
        },
      };
    },
    enabled: !!leagueKey && !!apiBase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
