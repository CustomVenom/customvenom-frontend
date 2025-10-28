'use client';

import { useEffect, useState } from 'react';

type Ops = {
  cache?: { rate?: number };
  coverage?: { overall?: number };
  pinball?: { overall?: number };
};

export default function OpsStatus({ api = process.env['NEXT_PUBLIC_API_BASE'] }: { api?: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${api}/ops-data`, { cache: 'no-store' });
        setOk(res.ok);
        const data: Ops = await res.json().catch(() => ({}) as Ops);
        if (!alive) return;
        setRate(data?.cache?.rate ?? null);
      } catch {
        if (!alive) return;
        setOk(false);
      }
    }

    load();
    const id = setInterval(load, 60_000); // refresh each minute
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [api]);

  const label = ok === null ? 'Checking…' : ok ? 'OK' : 'Degraded';
  const color = ok === null ? 'bg-gray-300' : ok ? 'bg-[var(--cv-primary)]' : 'bg-[#DC2626]';
  const cache = rate != null ? ` · cache ${(rate * 100).toFixed(0)}%` : '';

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span>
        API {label}
        {cache}
      </span>
    </span>
  );
}
