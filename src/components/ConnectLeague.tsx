'use client';

import { useCallback, useEffect, useState } from 'react';

const API = process.env['NEXT_PUBLIC_API_BASE'] ?? '';

type Status = 'unknown' | 'verifying' | 'connected' | 'disconnected';

type Me = { user?: { guid?: string } };
type Leagues = { league_keys?: string[] };
type Teams = { teams?: Array<{ team_key: string; name?: string }> };

export default function ConnectLeague() {
  const [status, setStatus] = useState<Status>('unknown');
  const [busy, setBusy] = useState(false);
  const [guid, setGuid] = useState<string>('');
  const [leagueKeys, setLeagueKeys] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [teams, setTeams] = useState<Array<{ team_key: string; name?: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isFreePlan] = useState(false); // DISABLED FOR DEVELOPMENT

  // Bulletproof session probe - single source of truth
  async function probeSession() {
    setStatus('verifying');
    try {
      const r = await fetch(`${API}/yahoo/me`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store', // avoid stale "connected" caches
        headers: { Accept: 'application/json' },
      });

      // Only consider connected if we get a 200 OK AND the response has a valid user
      if (r.ok) {
        const me = (await r.json()) as Me;
        // Double-check: must have a valid user GUID to be considered connected
        if (me.user?.guid) {
          setGuid(me.user.guid);
          setStatus('connected');

          // Load leagues only after confirmed connection
          try {
            const leagues = await fetch(`${API}/yahoo/leagues?format=json`, {
              credentials: 'include',
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            });
            if (leagues.ok) {
              const data = (await leagues.json()) as Leagues;
              const keys = data.league_keys ?? [];
              setLeagueKeys(keys);
              if (keys.length && !selectedLeague) setSelectedLeague(keys[0]!);
            }
          } catch {
            // League loading failure doesn't affect connection status
          }
        } else {
          // No valid user GUID = not connected
          setStatus('disconnected');
        }
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
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
    const ret = encodeURIComponent('/tools');
    window.location.href = `${API}/api/connect/start?host=yahoo&from=${ret}`;
  }

  async function refresh() {
    if (busy) return;
    setBusy(true);
    await probeSession();
    setBusy(false);
  }

  useEffect(() => {
    probeSession();
  }, []);

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

  const label = status === 'connected' ? 'Refresh League' : busy ? 'Redirecting…' : 'Connect League';

  const onClick = status === 'connected' ? refresh : connect;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onClick}
          disabled={busy || status === 'unknown' || status === 'verifying'}
          aria-busy={busy || status === 'verifying'}
          className={`cv-btn-primary ${busy || status === 'verifying' ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
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
