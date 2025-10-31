'use client';

import { useState, useEffect } from 'react';

export default function ConnectLeague() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/yahoo/me`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setConnected(true);
          setUserName(data?.fantasy_content?.users?.[0]?.user?.[0]?.guid || 'User');
        } else {
          setConnected(false);
        }
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = () => {
    const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    // OAuth flow: connect/start → yahoo/signin → Yahoo auth → yahoo/callback → back to dashboard
    window.location.href = `${API_BASE}/api/connect/start?from=/dashboard`;
  };

  const handleDisconnect = async () => {
    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      await fetch(`${API_BASE}/yahoo/signout`, {
        credentials: 'include',
      });
      setConnected(false);
      setUserName(null);
      window.location.reload();
    } catch {
      console.error('Disconnect failed:', e);
    }
  };

  if (loading) {
    return <div className="p-4">Loading connection status...</div>;
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Yahoo Fantasy Connection</h2>

      {connected ? (
        <div className="space-y-2">
          <p className="text-green-600">✓ Connected as {userName}</p>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Disconnect Yahoo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600">Connect your Yahoo Fantasy account to get started.</p>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Connect Yahoo
          </button>
        </div>
      )}
    </div>
  );
}
