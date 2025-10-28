'use client';

import { useYahooMe, useYahooLeagues } from '@/hooks/useYahoo';
import { Button } from '@/components/ui/Button';

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
        Please connect Yahoo to load your leagues.
        <div className="mt-2">
          <Button asChild>
            <a href={`${process.env['NEXT_PUBLIC_API_BASE']}/api/connect/start?host=yahoo&from=${encodeURIComponent('/tools')}`}>
              Connect Yahoo
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const guid = me.data?.guid ?? 'unknown';
  const leagueKeys = leagues.data?.league_keys ?? [];
  
  return (
    <div className="text-sm">
      Yahoo Connected — GUID: {guid} · Leagues: {leagueKeys.length}
    </div>
  );
}