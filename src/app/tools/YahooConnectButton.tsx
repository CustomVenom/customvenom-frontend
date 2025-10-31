'use client';

import { useEffect, useState } from 'react';

export default function YahooConnectButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    fetch(`${API_BASE}/yahoo/me`, { credentials: 'include', cache: 'no-store' })
      .then((res) => setConnected(res.ok))
      .catch(() => setConnected(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (connected) {
    return (
      <div className="p-4 border rounded-lg bg-green-50">
        <div className="font-medium text-green-800">League Connected</div>
      </div>
    );
  }

  const currentPath =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '/tools';
  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  return (
    <a
      href={`${API_BASE}/api/connect/start?host=yahoo&from=${encodeURIComponent(currentPath)}`}
      className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
    >
      Connect League
    </a>
  );
}


