'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedTeam } from '@/lib/selection';
import { probeYahooMe, getReqId, type ApiResult } from '@/lib/api';

export default function YahooConnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<{ state: 'needsAuth'; reqId: string } | null>(null);
  const { team_key } = useSelectedTeam();

  // 1) Probe connection using deduplicated API call
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Check if we're coming from OAuth callback (URL has code/state params)
        const urlParams = new URLSearchParams(window.location.search);
        const isOAuthCallback = urlParams.has('code') || urlParams.has('state');

        // Add delay after OAuth callback to prevent auth_required flicker
        if (isOAuthCallback) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const result = await probeYahooMe();
        if (!alive) return;

        if (result.ok) {
          setConnected(true);
          setAuthError(null);
        } else if (result.error === 'auth_required' || result.error === 'NO_YAHOO_SESSION') {
          setAuthError({ state: 'needsAuth', reqId: getReqId(result) });
          setConnected(false);
        } else {
          setConnected(false);
          setAuthError(null);
        }
      } catch {
        if (alive) {
          setConnected(false);
          setAuthError(null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) Actions
  const connect = () => {
    if (loading) return; // Prevent multiple launches

    setLoading(true);
    const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `${API_BASE}/api/yahoo/signin?from=${encodeURIComponent(currentPath)}`;
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      // hit your refresh endpoint or re-pull leagues
      await fetch(`${API_BASE}/yahoo/leagues`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      });
      router.refresh(); // revalidate page state
    } finally {
      setLoading(false);
    }
  };

  // 3) Render states
  if (connected === null) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {team_key ? 'League Integration' : 'Yahoo Fantasy (read‑only)'}
            </div>
            <div className="text-sm opacity-80">Checking connection status...</div>
          </div>
          <button disabled className="px-3 py-2 rounded bg-gray-300 text-gray-600">
            Checking…
          </button>
        </div>
      </div>
    );
  }

  if (authError?.state === 'needsAuth') {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Authentication required</div>
            <div className="text-sm opacity-80">
              Connect Yahoo
              <br />
              <span className="text-xs text-gray-500">Request ID: {authError.reqId}</span>
            </div>
          </div>
          <button
            onClick={connect}
            disabled={loading}
            data-testid="yahoo-connect-btn"
            className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            aria-label="Connect Yahoo"
          >
            {loading ? 'Redirecting…' : 'Connect Yahoo'}
          </button>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="p-4 border rounded-lg bg-green-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {team_key ? 'League Integration' : 'Yahoo Fantasy (read‑only)'}
            </div>
            <div className="text-sm opacity-80 flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-green-100 text-green-800">
                {team_key ? 'Connected ✓' : 'Yahoo connected ✓'}
              </span>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            aria-label="Refresh leagues"
          >
            {loading ? 'Refreshing…' : 'Refresh leagues'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">
            {team_key ? 'League Integration' : 'Yahoo Fantasy (read‑only)'}
          </div>
          <div className="text-sm opacity-80">Connect once, always return here.</div>
        </div>
        <button
          onClick={connect}
          data-testid="yahoo-connect-btn"
          className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800"
          aria-label="Connect leagues"
        >
          Connect Leagues
        </button>
      </div>
    </div>
  );
}
