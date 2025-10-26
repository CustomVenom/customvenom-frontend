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

export default function YahooPanelClient({ enabled }: { enabled: boolean }) {
  // Do not read env if not in browser
  const baseRaw = typeof window !== 'undefined' ? (process.env['NEXT_PUBLIC_API_BASE'] || '') : '';
  const apiBase = useMemo(() => {
    if (!baseRaw) return '';
    return baseRaw.startsWith('http') ? baseRaw : `https://${baseRaw}`;
  }, [baseRaw]);

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
        const r = await fetch('/api/yahoo/leagues', {
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

        // Teams
        const league = arr[0];
        if (!league) {
          setError('not_connected');
          return;
        }
        const rt = await fetch(`/api/yahoo/leagues/${encodeURIComponent(league.key)}/teams`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'accept': 'application/json' }
        });
        if (!rt.ok) {
          setError(rt.status === 401 ? 'not_connected' : `http_${rt.status}`);
          return;
        }
        const tdata = await rt.json().catch(() => null);
        const teams: YahooTeam[] = Array.isArray(tdata?.teams) ? tdata.teams : [];
        const team = teams[0] || null;
        if (!team) {
          setTeamKey(null);
          setRoster({ players: [] });
          return;
        }
        if (cancelled) return;
        setTeamKey(team.key);

        // Roster
        const rr = await fetch(`/api/yahoo/team/${encodeURIComponent(team.key)}/roster`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'accept': 'application/json' }
        });
        if (!rr.ok) {
          setError(rr.status === 401 ? 'not_connected' : `http_${rr.status}`);
          return;
        }
        const rdata: YahooRoster | null = await rr.json().catch(() => null);
        if (cancelled) return;
        setRoster(rdata && Array.isArray(rdata.players) ? rdata : { players: [] });
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
        API not configured.
      </Card>
    );
  }

  if (error === 'not_connected') {
    const CONNECT = apiBase ? `${apiBase}/api/yahoo/connect?returnTo=/settings` : '';
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        <div className="flex items-center gap-2">
          Yahoo: not connected.
          <a href={CONNECT} className="underline" data-testid="yahoo-connect-btn">
            Connect Yahoo
          </a>
        </div>
      </Card>
    );
  }

  if (error) {
    const CONNECT = apiBase ? `${apiBase}/api/yahoo/connect?returnTo=/settings` : '';
    return (
      <Card tone="red">
        Yahoo error: {error}. <a href={CONNECT} className="underline">Reconnect</a>
      </Card>
    );
  }

  const league = leagues?.[0] || null;
  const players = roster?.players ?? [];

  return (
    <Card tone="green">
      <div className="flex items-center justify-between mb-2">
        <div data-testid="yahoo-connected" className="font-medium">
          Yahoo Connected{league ? ` — ${league.name} (${league.season})` : ''}
        </div>
        <a href={`${apiBase}/api/yahoo/connect?returnTo=/settings`} className="underline opacity-80">
          Reconnect
        </a>
      </div>

      {players.length === 0 ? (
        <div className="text-sm opacity-80">No roster data yet.</div>
      ) : (
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left opacity-70">
              <th className="pr-4">Player</th>
              <th className="pr-4">Pos</th>
              <th className="pr-4">Team</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="pr-4">{p.name}</td>
                <td className="pr-4">{p.pos}</td>
                <td className="pr-4">{p.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
