import { cookies } from 'next/headers';

import { getYahooAdapter, getSleeperAdapter, getEspnAdapter } from './adapters';

import type { LeagueSummary } from '@/types/leagues';

export async function fetchAllLeagues(apiBase: string): Promise<LeagueSummary[]> {
  const c = await cookies();
  const tasks: Promise<LeagueSummary[]>[] = [];

  // Only call adapters for connected providers (based on NextAuth session)
  const { auth } = await import('../auth');
  const session = await auth();
  if (session?.user?.sub) tasks.push(getYahooAdapter(apiBase).listLeagues());
  if (c.get('sl_at')?.value) tasks.push(getSleeperAdapter(apiBase).listLeagues());
  if (c.get('espn_at')?.value) tasks.push(getEspnAdapter(apiBase).listLeagues());

  const results = await Promise.allSettled(tasks);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
