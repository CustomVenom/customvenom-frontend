'use client';

import ProjectionsTable from '@/components/ProjectionsTable';
import { makeApi } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';
import type { Row } from '@/lib/tools';

type ApiRow = {
  player: string;
  expected_points: number;
  range: [number, number];
};

function toRow(a: ApiRow): Row {
  // best-effort mapping; adjust when API adds richer fields
  return {
    player_id: a.player, // temporary until API provides an id
    player_name: a.player,
    team: '—',
    position: '—',
    range: {
      p10: a.range[0] ?? 0,
      p50: a.expected_points ?? 0,
      p90: a.range[1] ?? 0,
    },
    explanations: [], // empty until API provides explanations
    schema_version: 'v1', // placeholder
    last_refresh: new Date().toISOString(), // placeholder
  };
}

export default function ProjectionsPage() {
  const api = makeApi(process.env['NEXT_PUBLIC_API_BASE']!);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projections', '2025-06'],
    queryFn: async () => {
      const res = await api.projectionsGet({ week: '2025-06' });
      return res as { rows?: ApiRow[] };
    },
    staleTime: 60_000,
  });

  if (isLoading) return <div>Loading projections…</div>;
  if (isError) return <div>Could not load projections.</div>;

  const apiRows = ((data as { rows?: ApiRow[] })?.rows) ?? [];
  const rows: Row[] = apiRows.map(toRow);

  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <h1 className="text-lg font-semibold mb-3">Projections</h1>
      <ProjectionsTable rows={rows} />
    </div>
  );
}
