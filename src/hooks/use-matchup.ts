// React Query hook for matchup data with trust headers
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import { useTypedQuery } from '@/hooks/useTypedQuery';

interface MatchupResponse {
  your_team: {
    team_name: string;
    roster: Array<{
      player_id: string;
      name: string;
      position: string;
      team: string;
      projected_points: number;
    }>;
    total_projected: number;
  };
  opponent_team: {
    team_name: string;
    roster: Array<{
      player_id: string;
      name: string;
      position: string;
      team: string;
      projected_points: number;
    }>;
    total_projected: number;
  };
  win_probability: number;
}

export function useMatchup(leagueKey: string | null, week?: string) {
  const { selectedWeek } = useUserStore();
  const weekToUse = week || selectedWeek || getCurrentWeek();
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || '';

  return useTypedQuery<MatchupResponse>({
    queryKey: ['matchup', leagueKey, weekToUse],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/matchup/${leagueKey}/${weekToUse}`;
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
