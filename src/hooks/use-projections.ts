// React Query hook for projections with trust headers
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import type { PlayerProjection } from '@/types/projections';
import { useTypedQuery } from '@/hooks/useTypedQuery';

interface ProjectionsResponse {
  projections: PlayerProjection[];
  schema_version: string;
  last_refresh: string;
}

export function useProjections(week?: string) {
  const { activeSport, scoringFormat, selectedWeek } = useUserStore();
  const weekToUse = week || selectedWeek || getCurrentWeek();

  return useTypedQuery<ProjectionsResponse>({
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
      const result = await fetchWithTrust(url);
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 1,
  });
}
