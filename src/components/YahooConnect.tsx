'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface League {
  id: string;
  name: string;
  season: string;
}

interface YahooConnectProps {
  onConnected?: (sub: string | null) => void;
}

export default function YahooConnect(_props: YahooConnectProps = {}) {
  const { data: session, status } = useSession();
  const [leagues, setLeagues] = useState<League[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature flag gating
  const ENABLED = process.env['NEXT_PUBLIC_YAHOO_CONNECT_ENABLED'] === 'true';
  const MAINT = process.env['NEXT_PUBLIC_YAHOO_MAINTENANCE'] === 'true';
  const CANARY = (process.env['NEXT_PUBLIC_YAHOO_CANARY_EMAILS'] || '')
    .split(',')
    .map((s) => s.trim().toLowerCase());

  const isCanary = (email?: string) => !!email && CANARY.includes(email.toLowerCase());

  const handleFetchLeagues = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
      const response = await fetch('/api/leagues', {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch leagues');
      }

      const data = await response.json();
      setLeagues(data.leagues || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('[Yahoo Leagues Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const isYahooConnected = session?.user?.sub;

  if (status === 'loading') {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Yahoo Fantasy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isYahooConnected
              ? 'Connected - You can import your leagues'
              : 'Connect to import your fantasy leagues'}
          </p>
        </div>

        {!isYahooConnected ? (
          !ENABLED || MAINT || !isCanary(session?.user?.email) ? (
            <div className="text-gray-500 text-sm">
              {MAINT
                ? 'Yahoo integration is temporarily unavailable'
                : !ENABLED
                  ? 'Yahoo integration is disabled'
                  : 'Yahoo integration is in limited rollout'}
            </div>
          ) : (
            <a
              href="https://api.customvenom.com/api/connect/start?host=yahoo&from=/tools"
              className="cv-btn-primary"
              rel="nofollow"
            >
              Connect Yahoo
            </a>
          )
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓ Connected</span>
          </div>
        )}
      </div>

      {isYahooConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleFetchLeagues} disabled={loading} className="cv-btn-ghost mb-4">
            {loading ? 'Fetching...' : 'Fetch My Leagues'}
          </button>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {leagues && leagues.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Your Leagues ({leagues.length})</h4>
              <ul className="space-y-2">
                {leagues.map((league) => (
                  <li
                    key={league.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <div className="font-medium">{league.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Season: {league.season} • ID: {league.id}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leagues && leagues.length === 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">No leagues found</div>
          )}
        </div>
      )}
    </div>
  );
}

