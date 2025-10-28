'use client';
import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { fetchJson } from '@/lib/api';

export default function ConnectLeagues() {
  const { sess } = useSession();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connected = Boolean(sess?.providers?.includes('yahoo'));

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      if (!connected) {
        window.location.href = '/api/oauth/yahoo/launch';
        return;
      }

      const r = await fetchJson('/api/oauth/yahoo/refresh', {
        method: 'POST',
      });

      // Warm the leagues endpoint after refresh
      await fetchJson('/yahoo/leagues?details=true');

      setMsg(r.ok ? 'Synced leagues' : 'Sync failed');
    } catch (error) {
      console.error('Connect/refresh error:', error);
      setMsg('Network error');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm
          ${
            connected
              ? 'border-gray-300 text-gray-800 hover:bg-gray-50'
              : 'border-blue-300 text-blue-700 hover:bg-blue-50'
          }
          disabled:opacity-60`}
        title={connected ? 'Refresh or re-sync your leagues' : 'Connect your fantasy provider'}
      >
        <span aria-hidden="true">{connected ? '↻' : '🔗'}</span>
        <span>{busy ? 'Working…' : connected ? 'Refresh leagues' : 'Connect leagues'}</span>
      </button>
      {msg && (
        <span className="text-xs text-gray-600" role="status">
          {msg}
        </span>
      )}
    </div>
  );
}
