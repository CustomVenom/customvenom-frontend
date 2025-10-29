'use client';

import ProjectionsTable from '@/components/ProjectionsTable';
import type { Row } from '@/lib/tools';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type ApiRow = {
  player: string;
  expected_points: number;
  range: [number, number] | number[]; // be lenient
};

type ApiResponse = {
  rows?: ApiRow[];
  schema_version?: string;
  last_refresh?: string;
};

const WEEK = '2025-06';

function toRow(a: ApiRow): Row {
  const p10 = Array.isArray(a.range) ? (a.range[0] ?? 0) : 0;
  const p90 = Array.isArray(a.range) ? (a.range[1] ?? 0) : 0;
  const p50 = typeof a.expected_points === 'number' ? a.expected_points : 0;

  return {
    player_id: a.player, // temporary until API provides an id
    player_name: a.player,
    team: '—',
    position: '—',
    range: { p10, p50, p90 },
    explanations: [], // empty until API provides explanations
    schema_version: 'v1', // will override below if provided
    last_refresh: '', // will override below if provided
  };
}

export default function ProjectionsPage() {
  const API = useMemo(() => process.env['NEXT_PUBLIC_API_BASE']!, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projections', WEEK],
    queryFn: async (): Promise<ApiResponse> => {
      const r = await fetch(`${API}/projections?week=${encodeURIComponent(WEEK)}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('http_error');
      return r.json() as Promise<ApiResponse>;
    },
    staleTime: 60_000,
  });

  if (isLoading) return <div>Loading projections…</div>;
  if (isError || !data) return <div>Could not load projections.</div>;

  const apiRows = data.rows ?? [];
  const rows: Row[] = apiRows.map(toRow).map((r) => ({
    ...r,
    // carry page-level metadata if provided
    schema_version: data.schema_version ?? r.schema_version,
    last_refresh: data.last_refresh ?? r.last_refresh,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <h1 className="text-lg font-semibold mb-3">Projections</h1>
      <ProjectionsTable rows={rows} />
    </div>
  );
}
