// React Query hook for projections with trust headers
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@/lib/api-client';
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
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || '';

  return useQuery<ApiResponse<ProjectionsResponse>>({
    queryKey: ['projections', activeSport, weekToUse, scoringFormat],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('week', weekToUse);
      searchParams.set('sport', activeSport);
      if (scoringFormat) {
        searchParams.set('scoring_format', scoringFormat);
      }

      const url = `${apiBase}/api/projections?${searchParams.toString()}`;
      return fetchWithTrust<ProjectionsResponse>(url);
    },
    enabled: !!apiBase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 1,
  });
}
