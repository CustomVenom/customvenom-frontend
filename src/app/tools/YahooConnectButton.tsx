'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function YahooConnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  // 1) Probe connection (reads your app's /api/me or similar)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        if (!alive) return;
        // assume your shape has "connected" or similar
        setConnected(Boolean(data?.connected === true || (data?.connections ?? []).includes?.('yahoo')));
      } catch {
        if (alive) setConnected(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2) Actions
  const connect = () => {
    window.location.href = 'https://api.customvenom.com/api/connect/start?host=yahoo&from=%2Ftools'; // one hop only
  };

  const refresh = async () => {
    try {
      setLoading(true);
      // hit your refresh endpoint or re-pull leagues
      await fetch('/api/leagues/refresh', { method: 'POST', credentials: 'include', cache: 'no-store' });
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

  if (connected) {
    return (
      <div className="p-4 border rounded-lg bg-green-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Yahoo Fantasy (read‑only)</div>
            <div className="text-sm opacity-80 flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-green-100 text-green-800">
                Yahoo connected ✓
              </span>
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
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Yahoo Fantasy (read‑only)</div>
          <div className="text-sm opacity-80">Connect once, always return here.</div>
        </div>
        <button
          onClick={connect}
          className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800"
          aria-label="Connect Yahoo"
        >
          Connect Yahoo
        </button>
      </div>
    </div>
  );
}
