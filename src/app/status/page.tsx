'use client';

import { useEffect, useState } from 'react';
import { TrustSnapshot } from '@/components/TrustSnapshot';

type Ops = {
  cache?: { hits?: number; total?: number; rate?: number };
  coverage?: { QB?: number; RB?: number; WR?: number; TE?: number; overall?: number };
  pinball?: { overall?: number };
  chips?: { speak?: number; suppress?: number };
};

type HealthData = {
  ok: boolean;
  ready: boolean;
  schema_version: string;
  last_refresh: string;
  r2_key: string;
};

type ProjectionsData = {
  schema_version: string;
  last_refresh: string;
};

export default function StatusPage() {
  const [data, setData] = useState<Ops | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [projections, setProjections] = useState<ProjectionsData | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const api = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

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

    async function loadTrustSnapshot() {
      try {
        // Load /health
        const healthRes = await fetch(`${api}/health`, { cache: 'no-store' });
        const healthData: HealthData = await healthRes.json();
        const healthReqId = healthRes.headers.get('x-request-id') || '';
        if (!alive) return;
        setHealth(healthData);
        setRequestId(healthReqId);

        // Load /projections sample
        const projRes = await fetch(`${api}/projections?week=2025-09`, { cache: 'no-store' });
        const projData: ProjectionsData = await projRes.json();
        const staleHeader = projRes.headers.get('x-stale');
        if (!alive) return;
        setProjections(projData);
        setIsStale(staleHeader === 'true');
      } catch (e: unknown) {
        if (!alive) return;
        console.error('Failed to load trust snapshot:', e);
      }
    }

    load();
    loadTrustSnapshot();
    const id = setInterval(() => {
      load();
      loadTrustSnapshot();
    }, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [api]);

  return (
    <main className="container section space-y-4">
      <h1 className="h1">System Status</h1>
      <p className="text-sm text-muted">
        Live snapshot from API ops metrics. Refreshes every 60 seconds.
      </p>

      {/* Trust Snapshot */}
      {health && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3">System Trust Snapshot</h2>
          <div className="space-y-2">
            <TrustSnapshot ts={health.last_refresh} ver={health.schema_version} stale={isStale} />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Latest request_id: {requestId || '—'}
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              /health receipts
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                {`curl -sS "${api}/health" | jq '{ok, ready, schema_version, last_refresh, r2_key}'`}
              </pre>
              <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <div>cache-control: no-store</div>
                <div>x-request-id: {requestId || '&lt;uuid&gt;'}</div>
                <div>access-control-allow-origin: *</div>
              </div>
            </div>
          </details>

          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              /projections receipts
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                {`curl -sSD - "${api}/projections?week=2025-09" -o /tmp/body.json\njq '{schema_version, last_refresh}' /tmp/body.json`}
              </pre>
              <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <div>
                  cache-control: public, max-age=60, stale-while-revalidate=30, stale-if-error=86400
                </div>
                {projections && (
                  <>
                    <div>x-key: data/projections/nfl/2025/week=2025-09/baseline.json</div>
                    <div>x-stale: {isStale ? 'true' : 'false'}</div>
                    <div>x-request-id: &lt;uuid&gt;</div>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      )}

      {err && (
        <div className="rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-3 text-sm text-[rgb(var(--danger))] font-semibold">
          {err}
        </div>
      )}

      {!data && !err && (
        <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-3 text-sm text-[rgb(var(--text-secondary))]">
          Loading…
        </div>
      )}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Cache hit rate
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.cache?.rate != null ? (
                <>
                  {/* eslint-disable-next-line no-restricted-syntax -- Percentage formatting, not fantasy point calculation */}
                  {`${(data.cache.rate * 100).toFixed(0)}%`}
                </>
              ) : (
                '—'
              )}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Hits {data.cache?.hits ?? '—'} / {data.cache?.total ?? '—'}
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Coverage (overall)
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.coverage?.overall != null ? `${data.coverage.overall}%` : '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              QB {data.coverage?.QB ?? '—'} · RB {data.coverage?.RB ?? '—'} · WR{' '}
              {data.coverage?.WR ?? '—'} · TE {data.coverage?.TE ?? '—'}
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Pinball loss
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.pinball?.overall != null ? data.pinball.overall.toFixed(2) : '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Lower is better
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4">
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              Chips: speak / suppress
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {data.chips?.speak ?? '—'} / {data.chips?.suppress ?? '—'}
            </div>
            <div className="text-xs text-[rgb(var(--text-dim))] uppercase tracking-wide">
              UI clamp and confidence rules enforced
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a href="/projections" className="cv-btn-primary">
          Open Projections
        </a>
        <a href="/dashboard" className="cv-btn-ghost">
          Dashboard
        </a>
      </div>
    </main>
  );
}
