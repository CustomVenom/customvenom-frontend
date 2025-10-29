'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API = process.env['NEXT_PUBLIC_API_BASE'] ?? '';

type ConnectState = 'unknown' | 'disconnected' | 'connected' | 'verifying';

type Me = { user?: { guid?: string } };
type Leagues = { league_keys?: string[] };
type Teams = { teams?: Array<{ team_key: string; name?: string }> };

export default function ConnectLeague() {
  const [state, setState] = useState<ConnectState>('unknown');
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [guid, setGuid] = useState<string>('');
  const [leagueKeys, setLeagueKeys] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [teams, setTeams] = useState<Array<{ team_key: string; name?: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isFreePlan] = useState(true); // TODO: wire to real plan

  // small helper
  async function get<T>(path: string): Promise<T> {
    const r = await fetch(`${API}${path}`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(r.status === 401 ? 'auth_required' : 'http_error');
    return r.json() as Promise<T>;
  }

  const probe = useCallback(async () => {
    setLoading(true);
    try {
      const me = await get<Me>('/yahoo/me');
      setGuid(me.user?.guid ?? '');
      const leagues = await get<Leagues>('/yahoo/leagues?format=json');
      const keys = leagues.league_keys ?? [];
      setLeagueKeys(keys);
      if (keys.length && !selectedLeague) setSelectedLeague(keys[0]!);
      setConnected(true);
      setState('connected');
    } catch {
      setConnected(false);
      setState('disconnected');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]);

  const loadTeams = useCallback(
    async (leagueKey: string) => {
      if (!leagueKey) return;
      try {
        const data = await get<Teams>(
          `/yahoo/leagues/${encodeURIComponent(leagueKey)}/teams?format=json`,
        );
        const list = data.teams ?? [];
        setTeams(list);
        if (list.length && !selectedTeam) setSelectedTeam(list[0]!.team_key);
      } catch {
        setTeams([]);
      }
    },
    [selectedTeam],
  );

  const connectHref = useMemo(() => {
    // after consent, always come back to /tools
    const from = encodeURIComponent('/tools');
    return `${API}/api/connect/start?host=yahoo&from=${from}`;
  }, []);

  function handleConnect() {
    if (connecting) return;
    setConnecting(true);
    const ret = encodeURIComponent('/tools');
    window.location.href = `${API}/api/connect/start?host=yahoo&from=${ret}`;
  }

  async function handleRefresh() {
    setState('verifying');
    try {
      const me = await get<Me>('/yahoo/me');
      setState(me.user?.guid ? 'connected' : 'disconnected');
    } catch {
      setState('disconnected');
    }
  }

  useEffect(() => {
    void probe();
  }, [probe]);

  useEffect(() => {
    if (selectedLeague) void loadTeams(selectedLeague);
  }, [selectedLeague, loadTeams]);

  // UI
  if (!API) {
    return (
      <div className="border rounded p-3">
        <div className="text-sm opacity-75">API base not configured.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border rounded p-3">
        <div className="text-sm opacity-75">Checking league connection…</div>
      </div>
    );
  }

  const isBusy = connecting || state === 'verifying';
  const label = state === 'connected' ? 'Refresh' : (connecting ? 'Redirecting…' : 'Connect League');

  return (
    <div className="border rounded p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={state === 'connected' ? handleRefresh : handleConnect}
          disabled={isBusy}
          aria-busy={isBusy}
          className={`cv-btn-primary ${isBusy ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
          aria-label={label}
        >
          {label}
        </button>

        {/* Team chooser */}
        {teams.length > 1 && (
          <select
            className="border rounded px-2 py-1 bg-transparent text-sm"
            value={selectedTeam ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              if (isFreePlan && selectedTeam && id !== selectedTeam) {
                alert('Team locked on free plan. Upgrade to switch teams.');
                return;
              }
              if (isFreePlan && !selectedTeam) {
                setSelectedTeam(id); // first selection locks
                // TODO: persist selection (localStorage or API)
              } else {
                setSelectedTeam(id);
              }
            }}
          >
            <option value="" disabled>Select a team…</option>
            {teams.map(t => (
              <option key={t.team_key} value={t.team_key}>
                {t.name ?? t.team_key}
              </option>
            ))}
          </select>
        )}

        {teams.length === 1 && selectedTeam && (
          <span className="text-sm opacity-80">
            Team: {teams.find(t => t.team_key === selectedTeam)?.name ?? selectedTeam}
          </span>
        )}

        {isFreePlan && selectedTeam && teams.length > 1 && (
          <button className="cv-btn-ghost text-xs" disabled title="Upgrade to switch teams">
            Unlock more teams
          </button>
        )}
      </div>

      {/* League select (hidden if only one) */}
      {leagueKeys.length > 1 && (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm opacity-80">League</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            {leagueKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      )}

      {state === 'connected' && guid && (
        <div className="text-xs opacity-60 mt-2">
          Connected as {guid}
        </div>
      )}
    </div>
  );
}
