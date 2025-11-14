// React Query hook for roster with trust headers
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import type { RosterResponse } from '@/types/roster';
import { useTypedQuery } from '@/hooks/useTypedQuery';

export function useRoster(leagueKey: string | null) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || '';

  return useTypedQuery<RosterResponse>({
    queryKey: ['roster', leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/roster/${leagueKey}`;
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
