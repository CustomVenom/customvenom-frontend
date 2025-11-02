'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const API = process.env['NEXT_PUBLIC_API_BASE'] ?? '';

type Status = 'unknown' | 'verifying' | 'connected' | 'disconnected';

type YahooMeResponse = {
  profile?: { user?: { guid?: string } };
  fantasy_content?: { users?: Array<{ user?: Array<{ guid?: string }> }> };
};
type Leagues = { league_keys?: string[] };
type Teams = { teams?: Array<{ team_key: string; name?: string }> };

export default function ConnectLeague() {
  const [mounted, setMounted] = useState(false);
  const probeOnce = useRef(false);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<Status>('unknown');
  const [busy, setBusy] = useState(false);
  const [guid, setGuid] = useState<string>('');
  const [leagueKeys, setLeagueKeys] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [teams, setTeams] = useState<Array<{ team_key: string; name?: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isFreePlan] = useState(false); // DISABLED FOR DEVELOPMENT

  // Hydration guard - only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Probe session exactly once - prevent re-entry and StrictMode double-call
  async function probeSession() {
    if (inFlight.current) return;
    inFlight.current = true;

    setStatus('verifying');

    try {
      const url = `${API}/yahoo/me`;

      const r = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      // Treat 401 as normal "signed out" state
      if (!r.ok) {
        setStatus('disconnected');
        return;
      }

      const data = (await r.json().catch(() => ({}) as YahooMeResponse)) as YahooMeResponse;

      // Extract GUID with Yahoo shape fallback
      const guid =
        data?.profile?.user?.guid ?? data?.fantasy_content?.users?.[0]?.user?.[0]?.guid ?? null;

      // If no GUID, treat as disconnected
      if (!guid) {
        setStatus('disconnected');
        return;
      }

      // Valid GUID found
      setGuid(guid);
      setStatus('connected');

      // Load leagues only after confirmed connection
      try {
        const leagues = await fetch(`${API}/yahoo/leagues?format=json`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (leagues.ok) {
          const leagueData = (await leagues.json()) as Leagues;
          const keys = leagueData.league_keys ?? [];
          setLeagueKeys(keys);
          if (keys.length && !selectedLeague) setSelectedLeague(keys[0]!);
        }
      } catch (err) {
        console.warn('[ConnectLeague] probeSession: league fetch failed', err);
      }
    } catch (err) {
      console.error('[ConnectLeague] probeSession: error', err);
      setStatus('disconnected');
    } finally {
      inFlight.current = false;
    }
  }

  const loadTeams = useCallback(
    async (leagueKey: string) => {
      if (!leagueKey) return;
      try {
        const data = await fetch(
          `${API}/yahoo/leagues/${encodeURIComponent(leagueKey)}/teams?format=json`,
          {
            credentials: 'include',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          },
        );
        if (data.ok) {
          const result = (await data.json()) as Teams;
          const list = result.teams ?? [];
          setTeams(list);
          if (list.length && !selectedTeam) setSelectedTeam(list[0]!.team_key);
        }
      } catch {
        setTeams([]);
      }
    },
    [selectedTeam],
  );

  function connect() {
    if (busy) return;
    setBusy(true);
    const ret = encodeURIComponent('/dashboard');
    const redirectUrl = `${API}/api/connect/start?host=yahoo&from=${ret}`;
    window.location.href = redirectUrl;
  }

  async function refresh() {
    if (busy) return;
    setBusy(true);
    await probeSession();
    setBusy(false);
  }

  // Run probe exactly once on mount - prevent StrictMode double-call
  useEffect(() => {
    if (probeOnce.current) return;
    probeOnce.current = true;
    void probeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedLeague) return;
    const t = setTimeout(() => void loadTeams(selectedLeague), 0);
    return () => clearTimeout(t);
  }, [selectedLeague, loadTeams]);

  // UI - prevent hydration mismatch - stable placeholder until mounted
  if (!mounted) return <div style={{ height: 40 }} />;

  if (!API) {
    return (
      <div className="border rounded p-3">
        <div className="text-sm opacity-75">API base not configured.</div>
      </div>
    );
  }

  const isVerifying = status === 'unknown' || status === 'verifying';
  const isBusy = busy || isVerifying;
  const label =
    status === 'connected' ? 'Refresh League' : busy ? 'Redirecting…' : 'Connect League';

  const onClick = status === 'connected' ? refresh : connect;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onClick}
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
            <option value="" disabled>
              Select a team…
            </option>
            {teams.map((t) => (
              <option key={t.team_key} value={t.team_key}>
                {t.name ?? t.team_key}
              </option>
            ))}
          </select>
        )}

        {teams.length === 1 && selectedTeam && (
          <span className="text-sm opacity-80">
            Team: {teams.find((t) => t.team_key === selectedTeam)?.name ?? selectedTeam}
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

      {status === 'connected' && guid && (
        <div className="text-xs opacity-60 mt-2">Connected as {guid}</div>
      )}
    </div>
  );
}
