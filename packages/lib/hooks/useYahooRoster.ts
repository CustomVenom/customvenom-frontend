'use client';
import { useQuery } from '@tanstack/react-query';
import { CACHE } from '@/lib/react-query';

type CvSession = { user?: { id?: string; email?: string } | null; id?: string } | null | undefined;

function getUserId(session: CvSession): string | null {
  // Hard null/undefined check first
  if (!session) return null;

  // Preferred shape: session.user.id
  const nested = session.user?.id;
  if (typeof nested === 'string' && nested) return nested;

  // Legacy/rooted shape: session.id
  // Use Object.prototype.hasOwnProperty to avoid 'in' on possibly-null and to silence TS
  if (typeof session === 'object' && Object.prototype.hasOwnProperty.call(session, 'id')) {
    const sessionWithId = session as { id?: string };
    if (typeof sessionWithId.id === 'string' && sessionWithId.id) {
      return sessionWithId.id;
    }
  }

  return null;
}

export function useYahooRoster(params: {
  sport: 'nfl' | 'nba';
  session: CvSession;
  leagueKey?: string;
}) {
  const { sport, session, leagueKey } = params;
  const userId = getUserId(session);

  // Only enable the query when we have a session-derived userId and a leagueKey
  const enabled = Boolean(userId && leagueKey);

  return useQuery({
    queryKey: ['roster', sport, leagueKey],
    enabled,
    queryFn: async () => {
      if (!enabled) return { roster: [], leagueKey: leagueKey ?? '' };
      const res = await fetch(`/api/yahoo/roster?league_key=${encodeURIComponent(leagueKey!)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      return {
        leagueKey: leagueKey!,
        roster: data?.roster ?? data?.data?.roster ?? [],
      };
    },
    staleTime: CACHE.roster.staleTime,
    gcTime: CACHE.roster.gcTime,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
