// React Query hook for projections with trust headers
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PlayerProjection } from '@/types/projections';

interface ProjectionsResponse {
  projections: PlayerProjection[];
  schema_version: string;
  last_refresh: string;
}

export function useProjections(week?: string) {
  const { activeSport, scoringFormat, selectedWeek } = useUserStore();
  const weekToUse = week || selectedWeek || getCurrentWeek();

  return useQuery<ApiResponse<ProjectionsResponse>>({
    queryKey: ['projections', activeSport, weekToUse, scoringFormat],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('week', weekToUse);
      searchParams.set('sport', activeSport);
      if (scoringFormat) {
        searchParams.set('scoring_format', scoringFormat);
      }

      // Use Next.js API route (which proxies to Workers API or returns mock)
      const url = `/api/projections?${searchParams.toString()}`;
      return fetchWithTrust<ProjectionsResponse>(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 1,
  });
}
