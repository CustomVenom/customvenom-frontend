'use client';

import ProjectionsTable from '@/components/ProjectionsTable';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LeagueContextHeader } from '@/components/LeagueContextHeader';
import { useLeagueContext } from '@/hooks/useLeagueContext';
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

const WEEK = '2025-09';

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
  const leagueContext = useLeagueContext();
  const API = useMemo(() => process.env['NEXT_PUBLIC_API_BASE'] ?? '', []);

  // Parameterize week via URL search params
  const params = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);
  const week = params.get('week') ?? WEEK;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projections', week],
    queryFn: async (): Promise<ApiResponse> => {
      if (!API) throw new Error('API base not configured');
      const r = await fetch(`${API}/projections?week=${encodeURIComponent(week)}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('http_error');
      return r.json() as Promise<ApiResponse>;
    },
    staleTime: 60_000,
  });

  if (!API) return <div>API base not configured.</div>;

  if (isLoading) return <div className="animate-pulse h-6 w-48 bg-gray-200 rounded" />;
  if (isError || !data) return <div>Could not load projections.</div>;

  const rows: Row[] = (data.rows ?? []).map((a) => {
    const base = toRow(a);
    return {
      ...base,
      schema_version: data.schema_version ?? base.schema_version,
      last_refresh: data.last_refresh ?? base.last_refresh,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <Breadcrumb items={[{ label: 'Projections', href: '/dashboard/projections' }]} />

      {!leagueContext.isLoading && (
        <LeagueContextHeader
          leagueName={leagueContext.leagueName}
          teamName={leagueContext.teamName}
          week={leagueContext.week}
          scoringType={leagueContext.scoringType}
        />
      )}

      <h1 className="text-lg font-semibold mb-3">Projections</h1>
      <ProjectionsTable rows={rows} />
    </div>
  );
}
