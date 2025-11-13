// React Query hook for matchup data with trust headers
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@/lib/api-client';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

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

  return useQuery<ApiResponse<MatchupResponse>>({
    queryKey: ['matchup', leagueKey, weekToUse],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/matchup/${leagueKey}/${weekToUse}`;
      return fetchWithTrust<MatchupResponse>(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      });
    },
    enabled: !!leagueKey && !!apiBase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
