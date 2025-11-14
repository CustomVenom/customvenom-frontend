'use client';
import { useQuery } from '@tanstack/react-query';
import { getActiveLeagueKey, getRoster } from '../yahoo-client';
import type { CvSession } from './useSession';

function getUserId(session: CvSession): string | null {
  if (session?.user?.id) {
    return session.user.id;
  }
  // Handle legacy session shape where id might be at root
  if ('id' in session && typeof session.id === 'string') {
    return session.id;
  }
  return null;
}

export function useYahooRoster({ sport, session }: { sport: 'nfl' | 'nba'; session: CvSession }) {
  const userId = getUserId(session);

  // First, get the league key
  const { data: leagueKeyData } = useQuery({
    enabled: !!session && !!userId,
    queryKey: ['active-league-key', sport, userId],
    queryFn: async () => {
      const leagueKey = await getActiveLeagueKey({ sport });
      if (!leagueKey) throw new Error('No active league found');
      return leagueKey;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Then fetch roster with leagueKey in cache key
  return useQuery({
    enabled: !!session && !!userId && !!leagueKeyData,
    queryKey: ['roster', sport, leagueKeyData],
    queryFn: async () => {
      if (!leagueKeyData) throw new Error('No league key available');
      const { roster } = await getRoster({ leagueKey: leagueKeyData });
      return { roster, leagueKey: leagueKeyData };
    },
    staleTime: 5 * 60 * 1000,
  });
}
