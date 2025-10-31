'use client';

import Link from 'next/link';
import { useYahooLeagues, useYahooMe } from '@/hooks/useYahoo';

export function LeagueSwitcher() {
  const me = useYahooMe();
  const leagues = useYahooLeagues();

  if (me.isLoading || leagues.isLoading) {
    return <span className="text-xs text-gray-500">Loading leagues…</span>;
  }

  // Guard: Handle auth_required state first
  if (me.data?.auth_required || leagues.data?.auth_required) {
    return (
      <div className="p-3 border rounded text-sm">
        Please connect to load your leagues.
        <div className="mt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-black/90"
          >
            Go to Dashboard to Connect
          </Link>
        </div>
      </div>
    );
  }

  // Guard: Handle error states
  if (me.isError || leagues.isError || me.data?.error || leagues.data?.error) {
    return (
      <div className="p-3 border rounded text-sm">
        Could not load league data. Please try again.
      </div>
    );
  }

  // Guard: Only access data if we have a guid (meaning successful auth)
  if (!me.data || !me.data.guid) {
    return (
      <div className="p-3 border rounded text-sm">
        Please connect to load your leagues.
        <div className="mt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-black/90"
          >
            Go to Dashboard to Connect
          </Link>
        </div>
      </div>
    );
  }

  const guid = me.data.guid;
  const leagueKeys = leagues.data?.league_keys ?? [];

  return (
    <div className="text-sm">
      Connected — GUID: {guid} · Leagues: {leagueKeys.length}
    </div>
  );
}
