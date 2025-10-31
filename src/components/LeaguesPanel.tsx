'use client';

import { useEffect, useState } from 'react';

type LeagueRow = { key: string; name: string | null; teams?: number | null };
type TeamInfo = { name?: string | null; points?: number | null; key?: string };
type MatchupRow = { week: string | number | null; status: string | null; teamA: TeamInfo; teamB: TeamInfo };

export default function LeaguesPanel() {
  const [season, setSeason] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [teams, setTeams] = useState<Array<{ key: string; name?: string | null; managers?: string | null }>>([]);
  const [matchups, setMatchups] = useState<MatchupRow[]>([]);
  const [week, setWeek] = useState<string>(''); // optional week filter

  useEffect(() => {
    void loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  async function loadLeagues() {
    setLoading(true);
    setSelected(null);
    setTeams([]);
    setMatchups([]);
    try {
      const res = await fetch(
        `${process.env['NEXT_PUBLIC_API_BASE']}/api/yahoo/leagues?season=${encodeURIComponent(season)}`,
        { credentials: 'include' },
      );
      const body = await res.json();
      // Expect: { ok, league_keys, data: raw }
      const items: LeagueRow[] = (body?.league_keys ?? []).map((k: string) => {
        // Try grab name from raw, fallback null
        const leagueObj = (body?.data?.fantasy_content?.leagues?.[0]?.league ?? []).find?.(
          (x: { league_key?: string }) => x?.league_key === k,
        );
        return {
          key: k,
          name: leagueObj?.name ?? null,
          teams: leagueObj?.num_teams ?? null,
        };
      });
      setLeagues(items);
    } catch {
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  }

  async function openLeague(leagueKey: string) {
    setSelected(leagueKey);
    setTeams([]);
    setMatchups([]);
    // Teams
    const tRes = await fetch(
      `${process.env['NEXT_PUBLIC_API_BASE']}/api/yahoo/league/${encodeURIComponent(leagueKey)}/teams`,
      { credentials: 'include' },
    );
    const tBody = await tRes.json();
    setTeams(tBody?.teams ?? []);
    // Scoreboard
    const qs = week ? `?week=${encodeURIComponent(week)}` : '';
    const sRes = await fetch(
      `${process.env['NEXT_PUBLIC_API_BASE']}/api/yahoo/league/${encodeURIComponent(leagueKey)}/scoreboard${qs}`,
      { credentials: 'include' },
    );
    const sBody = await sRes.json();
    setMatchups(sBody?.matchups ?? []);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">Season</label>
        <input
          className="border px-2 py-1 rounded text-sm"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          placeholder="2024"
        />
        <button
          className="px-2 py-1 border rounded text-sm"
          onClick={loadLeagues}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load Leagues'}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Week</label>
          <input
            className="border px-2 py-1 rounded text-sm w-20"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>
      </div>

      <div className="border rounded">
        <div className="p-2 font-medium">Leagues</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Key</th>
              <th className="text-left p-2">Teams</th>
              <th className="text-left p-2">Open</th>
            </tr>
          </thead>
          <tbody>
            {leagues.length > 0 ? (
              leagues.map((l) => (
                <tr key={l.key} className="border-t">
                  <td className="p-2">{l.name ?? '—'}</td>
                  <td className="p-2">{l.key}</td>
                  <td className="p-2">{l.teams ?? '—'}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 border rounded" onClick={() => openLeague(l.key)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td className="p-2 text-center" colSpan={4}>
                  No leagues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded">
            <div className="p-2 font-medium">Teams</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t">
                  <th className="text-left p-2">Team</th>
                  <th className="text-left p-2">Manager</th>
                </tr>
              </thead>
              <tbody>
                {teams.length > 0 ? (
                  teams.map((t) => (
                    <tr key={t.key} className="border-t">
                      <td className="p-2">{t.name ?? '—'}</td>
                      <td className="p-2">{t.managers ?? '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="p-2 text-center" colSpan={2}>
                      —
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border rounded">
            <div className="p-2 font-medium">Scoreboard {week ? `(Week ${week})` : ''}</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t">
                  <th className="text-left p-2">A</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">B</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {matchups.length > 0 ? (
                  matchups.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{m.teamA?.name ?? '—'}</td>
                      <td className="p-2">{m.teamA?.points ?? '—'}</td>
                      <td className="p-2">{m.teamB?.name ?? '—'}</td>
                      <td className="p-2">{m.teamB?.points ?? '—'}</td>
                      <td className="p-2">{m.status ?? '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="p-2 text-center" colSpan={5}>
                      —
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
