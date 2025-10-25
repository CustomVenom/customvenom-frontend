'use client';

import { useEffect, useMemo, useState } from 'react';

type YahooLeague = { key: string; name: string; season: string };
type YahooTeam = { key: string; name: string; manager?: string };
type YahooRoster = { players: Array<{ id: string; name: string; pos: string; team: string }> };

function Card({
  children,
  tone = 'yellow',
}: {
  children: React.ReactNode;
  tone?: 'yellow' | 'green' | 'red';
}) {
  const map = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  } as const;
  return <div className={`p-3 border rounded ${map[tone]}`}>{children}</div>;
}

export default function YahooPanelClient() {
  // Do not read env if not in browser
  const baseRaw = typeof window !== 'undefined' ? (process.env['NEXT_PUBLIC_API_BASE'] || '') : '';
  const apiBase = useMemo(() => {
    if (!baseRaw) return '';
    return baseRaw.startsWith('http') ? baseRaw : `https://${baseRaw}`;
  }, [baseRaw]);

  // Short-circuit on disabled flag (read once on client)
  const enabled = typeof window !== 'undefined'
    ? ((window as unknown as { __CV_ENABLE_YAHOO__?: boolean })?.__CV_ENABLE_YAHOO__ ?? (process.env['NEXT_PUBLIC_ENABLE_YAHOO'] === 'true'))
    : false;

  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<YahooLeague[] | null>(null);
  const [_teamKey, setTeamKey] = useState<string | null>(null);
  const [roster, setRoster] = useState<YahooRoster | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function run() {
      try {
        if (!apiBase) {
          setError('not_configured');
          return;
        }
        const r = await fetch(`${apiBase}/yahoo/leagues`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'accept': 'application/json' }
        });
        if (!r.ok) {
          setError(r.status === 401 ? 'not_connected' : `http_${r.status}`);
          return;
        }
        const data = await r.json().catch(() => null);
        const arr: YahooLeague[] = Array.isArray(data?.leagues) ? data.leagues : [];
        if (!arr.length) {
          setError('not_connected');
          return;
        }
        if (cancelled) return;
        setLeagues(arr);
        // (Defer teams/roster to Step 4)
      } catch (e: unknown) {
        console.error(JSON.stringify({ scope: '[settings.yahoo].client', message: String(e) }));
        setError('unknown');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [apiBase, enabled]);

  if (!enabled) {
    return <div className="p-3 bg-gray-50 border rounded">Yahoo disabled</div>;
  }

  if (loading) {
    return (
      <Card tone="yellow">
        <div className="animate-pulse">Loading Yahoo…</div>
      </Card>
    );
  }

  if (!apiBase) {
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        Yahoo: not configured. Set NEXT_PUBLIC_API_BASE.
      </Card>
    );
  }

  if (error === 'not_connected') {
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        <div className="flex items-center gap-2">
          <span>Yahoo: not connected.</span>
          <a href="/api/yahoo/connect?returnTo=/settings" className="underline" data-testid="yahoo-connect-btn">
            Connect Yahoo
          </a>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card tone="red">
        Yahoo error: {error}. <a href="/api/yahoo/connect?returnTo=/settings" className="underline">Reconnect</a>
      </Card>
    );
  }

  const league = leagues?.[0] || null;

  return (
    <Card tone="green">
      <div className="flex items-center justify-between mb-2">
        <div data-testid="yahoo-connected" className="font-medium">
          Yahoo Connected{league ? ` — ${league.name} (${league.season})` : ''}
        </div>
        <a href="/api/yahoo/connect?returnTo=/settings" className="underline opacity-80">
          Reconnect
        </a>
      </div>
      <div className="text-sm opacity-80">Leagues loaded.</div>
    </Card>
  );
}
