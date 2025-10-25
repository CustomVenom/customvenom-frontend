'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type YahooLeague = { key: string; name: string; season: string };
type YahooTeam = { key: string; name: string; manager?: string };

type PanelState =
  | { status: 'loading' }
  | { status: 'not-configured' }
  | { status: 'not-connected' }
  | {
      status: 'connected';
      league: YahooLeague;
      players: Array<{ id: string; name: string; pos: string; team: string }>;
    };

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
  const [state, setState] = useState<PanelState>({ status: 'loading' });

  useEffect(() => {
    async function fetchData() {
      try {
        const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
        if (!apiBase) {
          setState({ status: 'not-configured' });
          return;
        }

        const res = await fetch(`${apiBase}/yahoo/leagues`, {
          cache: 'no-store',
          credentials: 'include', // Send cookies
        });

        if (!res.ok) {
          setState({ status: 'not-connected' });
          return;
        }

        const data = await res.json();
        if (!data?.leagues || !Array.isArray(data.leagues) || data.leagues.length === 0) {
          setState({ status: 'not-connected' });
          return;
        }

        const league = data.leagues[0];
        const players: Array<{ id: string; name: string; pos: string; team: string }> = [];

        // Try to fetch roster if we have a league
        if (league.key) {
          try {
            const teamsRes = await fetch(`${apiBase}/yahoo/leagues/${encodeURIComponent(league.key)}/teams`, {
              credentials: 'include',
            });
            if (teamsRes.ok) {
              const teamsData = await teamsRes.json();
              const team = teamsData?.teams?.[0];
              if (team?.key) {
                const rosterRes = await fetch(`${apiBase}/yahoo/team/${encodeURIComponent(team.key)}/roster`, {
                  credentials: 'include',
                });
                if (rosterRes.ok) {
                  const rosterData = await rosterRes.json();
                  players.push(...(rosterData?.players || []));
                }
              }
            }
          } catch {
            // Ignore roster fetch errors
          }
        }

        setState({ status: 'connected', league, players });
      } catch (error) {
        console.error('Yahoo panel fetch error:', error);
        setState({ status: 'not-connected' });
      }
    }

    fetchData();
  }, []);

  if (state.status === 'loading') {
    return (
      <Card tone="yellow">
        <div className="animate-pulse">Loading Yahoo data...</div>
      </Card>
    );
  }

  if (state.status === 'not-configured') {
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        Yahoo: not configured. Set NEXT_PUBLIC_API_BASE.
      </Card>
    );
  }

  if (state.status === 'not-connected') {
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        <div className="flex items-center gap-2">
          <span>Yahoo: not connected.</span>
          <Link
            href="/api/yahoo/connect?returnTo=/settings"
            className="underline"
            data-testid="yahoo-connect-btn"
          >
            Connect Yahoo
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card tone="green">
      <div className="flex items-center justify-between mb-2">
        <div data-testid="yahoo-connected" className="font-medium">
          Yahoo Connected — {state.league.name} ({state.league.season})
        </div>
        <Link href="/api/yahoo/connect?returnTo=/settings" className="underline opacity-80">
          Reconnect
        </Link>
      </div>

      {state.players.length === 0 ? (
        <div className="text-sm opacity-80">
          No roster data yet. Try refreshing after consent.
        </div>
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
            {state.players.map((p) => (
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
