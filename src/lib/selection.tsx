'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Selection = {
  league_key: string | null
  team_key: string | null
  pinned: boolean
}

const SelCtx = createContext<{
  selection: Selection
  setSelection: (next: Partial<Selection>) => Promise<void>
} | null>(null)

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]!) : null
}

const COOKIE = 'cv_sel'
const EMPTY: Selection = { league_key: null, team_key: null, pinned: false }

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSel] = useState<Selection>(EMPTY)

  // Hydrate once from cookie, then reconcile with server
  useEffect(() => {
    try {
      const raw = readCookie(COOKIE)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSel({
          league_key: parsed.lk ?? null,
          team_key: parsed.tk ?? null,
          pinned: !!parsed.p,
        })
      }
    } catch {
      // Ignore cookie parsing errors
    }
    ;(async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
        const res = await fetch(`${API_BASE}/api/session/selection`, { credentials: 'include' })
        if (res.ok) {
          const b = await res.json()
          setSel({
            league_key: b.active_league_key ?? null,
            team_key: b.active_team_key ?? null,
            pinned: !!b.pinned,
          })
        }
      } catch {
        // Ignore fetch errors
      }
    })()
  }, [])

  const api = useMemo(() => ({
    selection,
    setSelection: async (next: Partial<Selection>) => {
      const body = {
        league_key: next.league_key ?? selection.league_key,
        team_key: next.team_key ?? selection.team_key,
        pinned: typeof next.pinned === 'boolean' ? next.pinned : selection.pinned,
      }
      // Server source of truth
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
      const res = await fetch(`${API_BASE}/api/session/selection`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const b = await res.json()
        const sel: Selection = {
          league_key: b.active_league_key ?? null,
          team_key: b.active_team_key ?? null,
          pinned: !!b.pinned,
        }
        setSel(sel)
        // Mirror cookie for fast boot
        const payload = encodeURIComponent(JSON.stringify({
          lk: sel.league_key, tk: sel.team_key, p: sel.pinned ? 1 : 0, ts: Date.now(),
        }))
        // 90 days, SameSite=Lax for site nav; HttpOnly not set since client writes this mirror
        document.cookie = `${COOKIE}=${payload}; Max-Age=${60 * 60 * 24 * 90}; Path=/; Secure; SameSite=Lax`
        // Mirror to localStorage for instant client hydration
        try { localStorage.setItem('cv:sel', JSON.stringify(sel)) } catch {
          // Ignore localStorage errors
        }
      } else {
        // Optionally handle NO_SESSION → prompt connect
      }
    },
  }), [selection])

  return <SelCtx.Provider value={api}>{children}</SelCtx.Provider>
}

export function useSelectedLeague() {
  const ctx = useContext(SelCtx)
  if (!ctx) throw new Error('SelectionProvider missing')
  return { league_key: ctx.selection.league_key, setSelection: ctx.setSelection }
}

export function useSelectedTeam() {
  const ctx = useContext(SelCtx)
  if (!ctx) throw new Error('SelectionProvider missing')
  return { team_key: ctx.selection.team_key, setSelection: ctx.setSelection }
}
