'use client';

import { useYahooLeagues, useYahooMe } from '@/hooks/useYahoo';
import Link from 'next/link';
import ToolsTabs from '@/components/ToolsTabs';
import { TeamSelector } from '@/components/TeamSelector';
import RefreshLeaguesButton from './components/RefreshLeaguesButton';
import { useSelectedLeague } from '@/hooks/useSelectedLeague';

export default function LeaguesPage() {
  const { data: me, isLoading: isLoadingMe } = useYahooMe();
  const { data: leagues, isLoading: isLoadingLeagues } = useYahooLeagues();
  const { league, setLeague } = useSelectedLeague();

  if (isLoadingMe || isLoadingLeagues) return <div>Loading Yahoo data…</div>;

  // Guard: Handle auth_required state first
  if (me?.auth_required || leagues?.auth_required) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-3">
        <h1 className="text-lg font-semibold mb-3">My Yahoo Leagues</h1>
        <p>Please connect to view your leagues.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Go to Dashboard to Connect
        </Link>
      </div>
    );
  }

  // Guard: Handle error states
  if (me?.error || leagues?.error) {
    return (
      <div>Could not load league data. Please try again or connect if you haven't already.</div>
    );
  }

  // Guard: Ensure me has guid before accessing
  if (!me || !me.guid) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-3">
        <h1 className="text-lg font-semibold mb-3">My Yahoo Leagues</h1>
        <p>Please connect to view your leagues.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Go to Dashboard to Connect
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <ToolsTabs />
      <h1 className="text-lg font-semibold mb-3">My Yahoo Leagues</h1>

      {/* Clear Connected PASS Indicator */}
      <div
        role="status"
        className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 mb-4"
      >
        Yahoo Connected — GUID: {me?.guid ?? 'unknown'} · Leagues:{' '}
        {leagues?.league_keys?.length ?? 0}
      </div>

      {/* Team Selector and Refresh Button */}
      <div className="flex items-center gap-3 mb-4">
        <RefreshLeaguesButton />
        <TeamSelector />
      </div>

      {leagues?.league_keys &&
      Array.isArray(leagues.league_keys) &&
      leagues.league_keys.length > 0 ? (
        <>
          <h2 className="text-md font-semibold mt-4 mb-2">Your Leagues:</h2>
          <ul className="space-y-2">
            {leagues.league_keys.map((key) => (
              <li key={key}>
                <button
                  onClick={() => setLeague(key)}
                  className={`w-full text-left p-2 border rounded transition-colors ${
                    league === key
                      ? 'bg-blue-50 border-blue-300 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-mono text-sm">{key}</span>
                  {league === key && (
                    <span className="ml-2 text-xs text-blue-600">✓ Selected</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4">No leagues found for this Yahoo account.</p>
      )}
    </div>
  );
}
