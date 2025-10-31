'use client';

import { useState, useEffect } from 'react';
import TeamSelector from '@/components/TeamSelector';
import RefreshLeaguesButton from '@/components/RefreshLeaguesButton';
import { useSelectedLeague } from '@/lib/selection';

interface YahooMe {
  guid?: string;
  auth_required?: boolean;
  error?: string;
}

interface YahooLeagues {
  league_keys?: string[];
  auth_required?: boolean;
  error?: string;
}

export default function LeaguesPage() {
  const [me, setMe] = useState<YahooMe | null>(null);
  const [leagues, setLeagues] = useState<YahooLeagues | null>(null);
  const [loading, setLoading] = useState(true);
  const { league_key, setSelection } = useSelectedLeague();

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, leaguesRes] = await Promise.all([
          fetch(`${API_BASE}/yahoo/me`, { credentials: 'include' }),
          fetch(`${API_BASE}/yahoo/leagues?format=json`, { credentials: 'include' }),
        ]);

        if (meRes.ok) {
          setMe(await meRes.json());
        }
        if (leaguesRes.ok) {
          setLeagues(await leaguesRes.json());
        }
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with buttons */}
      <div className="flex items-center gap-4 flex-wrap">
        <RefreshLeaguesButton />
        <TeamSelector />
      </div>

      {/* Connection status */}
      {me?.guid && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Connected — GUID: {me.guid} · Leagues: {leagues?.league_keys?.length || 0}
        </div>
      )}

      {/* Leagues list */}
      {leagues?.league_keys && leagues.league_keys.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold">Your Leagues</h2>
          <ul className="space-y-2">
            {leagues.league_keys.map((key: string) => (
              <li key={key}>
                <button
                  onClick={() => setSelection({ league_key: key })}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    league_key === key
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{key}</div>
                  {league_key === key && (
                    <div className="text-xs text-blue-600 mt-1">✓ Selected</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-500">No leagues found for this account.</p>
      )}
    </div>
  );
}
