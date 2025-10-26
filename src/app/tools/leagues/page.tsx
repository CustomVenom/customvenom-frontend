// Leagues Tool Page
// Provider-agnostic league management and connection
//
// Architecture:
// - Fetches leagues from /app/me/leagues (proxy to Workers API)
// - Workers API sources leagues via adapters (src/lib/leagues/adapters.ts)
// - Entitlements and synced state come from Workers API for server-side enforcement
//
// Future: Can use fetchAllLeagues() directly for client-side league fetching
// once Workers API endpoints are implemented.

import { cookies } from 'next/headers';

import LeaguesTable from './components/LeaguesTable';
import { RefreshLeaguesButton } from './components/RefreshLeaguesButton';

import ToolsTabs from '@/components/ToolsTabs';
import type { MeLeaguesResponse } from '@/types/leagues';

export const dynamic = 'force-dynamic';

async function getMeLeagues(): Promise<MeLeaguesResponse | null> {
  try {
    const baseUrl = process.env['NEXT_PUBLIC_FRONTEND_BASE'] || 'https://www.customvenom.com';
    const r = await fetch(`${baseUrl}/app/me/leagues`, {
      cache: 'no-store',
      headers: {
        cookie: cookies().toString(),
      },
    });

    if (!r.ok) {
      console.error('[getMeLeagues]', r.status, await r.text());
      return null;
    }

    return await r.json();
  } catch (error) {
    console.error('[getMeLeagues]', error);
    return null;
  }
}

export default async function LeaguesPage() {
  const cookieStore = await cookies();

  // Check for provider tokens as fallback
  const { auth } = await import('../../../lib/auth');
  const session = await auth();
  const yahooToken = session?.user?.sub;
  const sleeperToken = cookieStore.get('sl_at')?.value;
  const espnToken = cookieStore.get('espn_at')?.value;

  const hasAnyConnection = yahooToken || sleeperToken || espnToken;

  // Try to fetch from API
  const meData = await getMeLeagues();

  return (
    <>
      <h1 className="h1">Fantasy Leagues</h1>
      <ToolsTabs />

      <div className="section">
        {!hasAnyConnection && !meData ? (
          // No providers connected - show connect card
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <h2 className="h2 mb-4">Connect Your Fantasy League</h2>
            <p className="text-muted mb-6">
              Link your Yahoo, Sleeper, or ESPN account to view and manage your leagues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`${process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com'}/api/connect/start?host=yahoo&from=${encodeURIComponent('/tools/leagues')}`}
                className="cv-btn-primary inline-block px-6 py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                aria-label="Connect Yahoo"
              >
                Connect Yahoo
              </a>
              <button
                disabled
                className="cv-btn-primary inline-block px-6 py-3 rounded-lg text-white bg-gray-400 cursor-not-allowed opacity-50"
                aria-label="Connect Sleeper (Coming Soon)"
              >
                Connect Sleeper (Coming Soon)
              </button>
              <button
                disabled
                className="cv-btn-primary inline-block px-6 py-3 rounded-lg text-white bg-gray-400 cursor-not-allowed opacity-50"
                aria-label="Connect ESPN (Coming Soon)"
              >
                Connect ESPN (Coming Soon)
              </button>
            </div>
          </div>
        ) : meData ? (
          // API data available - show entitlement-aware table
          <div className="space-y-6">
            {/* Provider Status Bar */}
            {meData.connections.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  {meData.connections.map((conn) => (
                    <span
                      key={conn.provider}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      ✓ {conn.provider.charAt(0).toUpperCase() + conn.provider.slice(1)} Connected
                    </span>
                  ))}
                </div>
                <RefreshLeaguesButton />
              </div>
            )}

            {/* Leagues Table */}
            <LeaguesTable initialData={meData} />
          </div>
        ) : (
          // Fallback: has connections but no API data yet
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <h3 className="h3 mb-2">Loading Leagues</h3>
            <p className="text-muted">Fetching your leagues from connected providers...</p>
          </div>
        )}
      </div>
    </>
  );
}

