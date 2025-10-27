'use client';

import { useEffect, useState } from 'react';

interface League {
  id: string;
  name: string;
  season: string;
}

export function ConnectYahoo() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'];

  // Check connection status and fetch leagues
  useEffect(() => {
    if (!API_BASE) {
      setConnected(false);
      return;
    }

    let alive = true;

    const checkConnection = async () => {
      try {
        // Check if user is connected
        const userRes = await fetch(`${API_BASE}/yahoo/me`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { accept: 'application/json' }
        });

        if (!alive) return;

        if (userRes.ok) {
          await userRes.json();
          setConnected(true);

          // Fetch leagues
          const leaguesRes = await fetch(`${API_BASE}/yahoo/leagues`, {
            credentials: 'include',
            cache: 'no-store',
            headers: { accept: 'application/json' }
          });

          if (leaguesRes.ok) {
            const leaguesData = await leaguesRes.json();
            setLeagues(leaguesData.items || []);
          }
        } else {
          setConnected(false);
          setLeagues([]);
        }
      } catch (_err) {
        if (alive) {
          setConnected(false);
          setError('Failed to check connection status');
        }
      }
    };

    checkConnection();
    return () => { alive = false; };
  }, [API_BASE]);

  const refresh = async () => {
    if (!API_BASE) return;

    try {
      setLoading(true);
      setError(null);

      // Refresh leagues
      const res = await fetch(`${API_BASE}/yahoo/leagues`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setLeagues(data.items || []);
      } else {
        setError('Failed to refresh leagues');
      }
    } catch (_err) {
      setError('Failed to refresh leagues');
    } finally {
      setLoading(false);
    }
  };

  // Not configured state
  if (!API_BASE) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Yahoo Fantasy (read‑only)</div>
            <div className="text-sm opacity-80">API not configured. Set NEXT_PUBLIC_API_BASE.</div>
          </div>
          <button disabled className="px-3 py-2 rounded bg-gray-300 text-gray-600">
            Not Configured
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (connected === null) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Yahoo Fantasy (read‑only)</div>
            <div className="text-sm opacity-80">Checking connection status...</div>
          </div>
          <button disabled className="px-3 py-2 rounded bg-gray-300 text-gray-600">
            Checking Yahoo…
          </button>
        </div>
      </div>
    );
  }

  // Connected state
  if (connected) {
    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Yahoo Fantasy (read‑only)</div>
              <div className="text-sm opacity-80 flex items-center gap-2">
                <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-green-100 text-green-800">
                  Yahoo connected ✓
                </span>
                {leagues.length > 0 && (
                  <span className="text-gray-600">
                    {leagues.length} league{leagues.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              aria-label="Refresh leagues from Yahoo"
            >
              {loading ? 'Refreshing…' : 'Refresh leagues'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {leagues.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Your Leagues</h3>
            <div className="space-y-2">
              {leagues.map((league) => (
                <div key={league.id} className="p-3 bg-white border rounded-lg">
                  <div className="font-medium">{league.name}</div>
                  <div className="text-sm text-gray-600">Season {league.season}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not connected state - show status only, no Connect button
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Yahoo Fantasy (read‑only)</div>
          <div className="text-sm opacity-80">Not connected. <a href="/tools" className="text-blue-600 hover:underline">Go to Tools to connect</a>.</div>
        </div>
        <span className="px-3 py-2 rounded bg-gray-100 text-gray-600 text-sm">
          Not Connected
        </span>
      </div>
    </div>
  );
}
