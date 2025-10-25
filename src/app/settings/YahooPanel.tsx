import 'server-only';
import Link from 'next/link';
import { safeFetchJson } from '@/utils/safeFetchJson';

type YahooLeague = { key: string; name: string; season: string };
type YahooTeam = { key: string; name: string; manager?: string };
type YahooRoster = { players: Array<{ id: string; name: string; pos: string; team: string }> };

function hasLeagues(x: unknown): x is { leagues: YahooLeague[] } {
  return !!x && typeof x === 'object' && Array.isArray((x as Record<string, unknown>)['leagues']);
}

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

export default async function YahooPanel() {
  try {
    const base =
      process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE'] || '';
    // Guard missing env
    if (!base) {
      return (
        <Card tone="yellow" data-testid="yahoo-status">
          Yahoo: not configured. Set NEXT_PUBLIC_API_BASE.
        </Card>
      );
    }

    // Ensure absolute URL (prevent accidental relative paths)
    const apiBase = base.startsWith('http') ? base : `https://${base}`;

      // Try to fetch leagues (requires OAuth cookie set by /auth/yahoo)
    const leagues = await safeFetchJson<{
      games?: unknown;
      leagues?: YahooLeague[];
    }>(`${apiBase}/yahoo/leagues`);

  if (!hasLeagues(leagues) || leagues.leagues.length === 0) {
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

  const leaguesArr = leagues.leagues;
  const league = leaguesArr[0]; // minimal viable: first league

  if (!league) {
    return (
      <Card tone="yellow" data-testid="yahoo-status">
        No leagues found. <Link href="/api/yahoo/connect?returnTo=/settings" className="underline">Connect Yahoo</Link>
      </Card>
    );
  }

  // Fetch teams for chosen league, pick first team that looks like "yours"
  const teamsResp = await safeFetchJson<{ teams?: YahooTeam[] }>(
    `${apiBase}/yahoo/leagues/${encodeURIComponent(league.key)}/teams`
  );
  const teams = (teamsResp?.teams ?? []) as YahooTeam[];
  const team = teams.at(0);

  // Fetch roster; always degrade gracefully
  const rosterResp = team
    ? await safeFetchJson<YahooRoster>(
        `${apiBase}/yahoo/team/${encodeURIComponent(team.key)}/roster`
      )
    : null;
  const players = rosterResp?.players ?? [];

  return (
    <Card tone="green">
      <div className="flex items-center justify-between mb-2">
        <div data-testid="yahoo-connected" className="font-medium">
          Yahoo Connected — {league.name} ({league.season})
        </div>
        <Link href="/api/yahoo/connect?returnTo=/settings" className="underline opacity-80">
          Reconnect
        </Link>
      </div>

      {players.length === 0 ? (
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
  } catch (error: unknown) {
    // Log error with structured data
    const err = error as { digest?: string; message?: string };
    console.error(
      JSON.stringify({
        scope: '[settings.yahoo]',
        digest: err?.digest || null,
        msg: err?.message || 'Unknown error',
      })
    );

    // Re-throw to trigger ErrorBoundary
    throw error;
  }
}
