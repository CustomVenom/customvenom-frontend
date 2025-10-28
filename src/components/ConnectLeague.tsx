'use client'

import { useEffect, useMemo, useState } from 'react'

const API = process.env['NEXT_PUBLIC_API_BASE']!

type Me = { user?: { guid?: string } }
type Leagues = { league_keys?: string[] }
type Teams = { teams?: Array<{ team_key: string; name?: string }> }

export default function ConnectLeague() {
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [guid, setGuid] = useState<string>('')
  const [leagueKeys, setLeagueKeys] = useState<string[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [teams, setTeams] = useState<Teams['teams']>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')

  // small helper
  async function get<T>(path: string): Promise<T> {
    const r = await fetch(`${API}${path}`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })
    if (!r.ok) throw new Error(r.status === 401 ? 'auth_required' : 'http_error')
    return r.json() as Promise<T>
  }

  async function probe() {
    setLoading(true)
    try {
      const me = await get<Me>('/yahoo/me')
      setGuid(me.user?.guid ?? '')
      const leagues = await get<Leagues>('/yahoo/leagues?format=json')
      const keys = leagues.league_keys ?? []
      setLeagueKeys(keys)
      if (keys.length && !selectedLeague) setSelectedLeague(keys[0]!)
      setConnected(true)
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  async function loadTeams(leagueKey: string) {
    if (!leagueKey) return
    try {
      const data = await get<Teams>(`/yahoo/leagues/${encodeURIComponent(leagueKey)}/teams?format=json`)
      const list = data.teams ?? []
      setTeams(list)
      if (list.length && !selectedTeam) setSelectedTeam(list[0]!.team_key)
    } catch {
      setTeams([])
    }
  }

  const connectHref = useMemo(() => {
    // after consent, always come back to /tools
    const from = encodeURIComponent('/tools')
    return `${API}/api/connect/start?host=yahoo&from=${from}`
  }, [])

  useEffect(() => {
    void probe()
  }, [])

  useEffect(() => {
    if (selectedLeague) void loadTeams(selectedLeague)
  }, [selectedLeague])

  // UI
  if (loading) {
    return (
      <div className="border rounded p-3">
        <div className="text-sm opacity-75">Checking league connection…</div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="border rounded p-3 flex items-center justify-between">
        <div className="text-sm opacity-80">Not connected.</div>
        <a
          href={connectHref}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-black/90"
        >
          Connect league
        </a>
      </div>
    )
  }

  return (
    <div className="border rounded p-3 grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Connected · {guid || 'unknown'}</div>
        <button
          onClick={() => void probe()}
          className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Refresh league
        </button>
      </div>

      {/* League select (hidden if only one) */}
      {leagueKeys.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">League</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            {leagueKeys.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      )}

      {/* Team select (hidden if only one) */}
      {teams.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Team</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t.team_key} value={t.team_key}>
                {t.name ?? t.team_key}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
