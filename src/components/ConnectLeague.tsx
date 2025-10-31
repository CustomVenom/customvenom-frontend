'use client';

import { useState, useEffect } from 'react';

export default function ConnectLeague() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      // Only auto-check if user has connected before
      const hasConnectedBefore = localStorage.getItem('cv_has_connected');

      if (!hasConnectedBefore) {
        setLoading(false);
        return;
      }

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
          // Clear flag if no longer connected
          localStorage.removeItem('cv_has_connected');
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
    // Mark that user has initiated connection
    localStorage.setItem('cv_has_connected', 'true');

    const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    window.location.href = `${API_BASE}/api/connect/start?from=/dashboard`;
  };

  const handleDisconnect = async () => {
    try {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      await fetch(`${API_BASE}/yahoo/signout`, {
        credentials: 'include',
      });

      // Clear the flag so next visit doesn't auto-check
      localStorage.removeItem('cv_has_connected');

      setConnected(false);
      setUserName(null);
      window.location.reload();
    } catch (e) {
      console.error('Disconnect failed:', e);
    }
  };

  if (loading) {
    return <div className="p-4">Checking connection...</div>;
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Yahoo Fantasy Connection</h2>

      {connected ? (
        <div className="space-y-2">
          <p className="text-green-600">✓ Connected as {userName}</p>
          {/* Hide disconnect button if you don't want it visible */}
          <button
            onClick={handleDisconnect}
            className="hidden px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
