'use client';

import Link from 'next/link';
import { useYahooLeagues, useYahooMe } from '@/hooks/useYahoo';

export function LeagueSwitcher() {
  const me = useYahooMe();
  const leagues = useYahooLeagues();

  if (me.isLoading || leagues.isLoading) {
    return <span className="text-xs text-gray-500">Loading leagues…</span>;
  }

  if (me.isError || leagues.isError) {
    // Do not throw — render unauth state
    return (
      <div className="p-3 border rounded text-sm">
        Please connect to load your leagues.
        <div className="mt-2">
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-black/90"
          >
            Go to Tools to Connect
          </Link>
        </div>
      </div>
    );
  }

  const guid = me.data?.guid ?? 'unknown';
  const leagueKeys = leagues.data?.league_keys ?? [];

  return (
    <div className="text-sm">
      Connected — GUID: {guid} · Leagues: {leagueKeys.length}
    </div>
  );
}
