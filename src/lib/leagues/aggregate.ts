import { cookies } from 'next/headers';
import type { LeagueSummary } from '@/types/leagues';
import { getYahooAdapter, getSleeperAdapter, getEspnAdapter } from './adapters';

export async function fetchAllLeagues(apiBase: string): Promise<LeagueSummary[]> {
  const c = await cookies();
  const tasks: Promise<LeagueSummary[]>[] = [];

  // Only call adapters for connected providers (based on presence of cookies)
  if (c.get('y_at')?.value) tasks.push(getYahooAdapter(apiBase).listLeagues());
  if (c.get('sl_at')?.value) tasks.push(getSleeperAdapter(apiBase).listLeagues());
  if (c.get('espn_at')?.value) tasks.push(getEspnAdapter(apiBase).listLeagues());

  const results = await Promise.allSettled(tasks);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
