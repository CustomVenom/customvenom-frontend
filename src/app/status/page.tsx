'use client';

import { useEffect, useState } from 'react';

type Ops = {
  cache?: { hits?: number; total?: number; rate?: number };
  coverage?: { QB?: number; RB?: number; WR?: number; TE?: number; overall?: number };
  pinball?: { overall?: number };
  chips?: { speak?: number; suppress?: number };
};

export default function StatusPage() {
  const [data, setData] = useState<Ops | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const api = process.env.NEXT_PUBLIC_API_BASE!;

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        const res = await fetch(`${api}/ops-data`, { cache: 'no-store' });
        const json: Ops = await res.json();
        if (!alive) return;
        setData(json);
      } catch (e: unknown) {
        if (!alive) return;
        console.error('Failed to load status:', e);
        setErr('Unable to load status right now.');
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [api]);

  return (
    <main className="container section space-y-4">
      <h1 className="h1">System Status</h1>
      <p className="text-sm text-muted">Live snapshot from API ops metrics. Refreshes every 60 seconds.</p>

      {err && <div className="rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-3 text-sm text-[rgb(var(--danger))] font-semibold">{err}</div>}

      {!data && !err && (
        <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-3 text-sm text-[rgb(var(--text-secondary))]">Loading…</div>
      )}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">Cache hit rate</div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.cache?.rate != null ? `${(data.cache.rate * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Hits {data.cache?.hits ?? '—'} / {data.cache?.total ?? '—'}
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">Coverage (overall)</div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.coverage?.overall != null ? `${data.coverage.overall}%` : '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              QB {data.coverage?.QB ?? '—'} · RB {data.coverage?.RB ?? '—'} · WR {data.coverage?.WR ?? '—'} · TE {data.coverage?.TE ?? '—'}
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">Pinball loss</div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.pinball?.overall != null ? data.pinball.overall.toFixed(2) : '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">Lower is better</div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">Chips: speak / suppress</div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.chips?.speak ?? '—'} / {data.chips?.suppress ?? '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">UI clamp and confidence rules enforced</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a href="/projections" className="cv-btn-primary">Open Projections</a>
        <a href="/tools" className="cv-btn-ghost">Tools</a>
      </div>
    </main>
  );
}

