'use client';

import ProjectionsTable from '@/components/ProjectionsTable';
import { makeApi } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';

type ApiRow = {
  player: string;
  expected_points: number;
  range: [number, number];
};

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

  const rows = data?.rows ?? [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <h1 className="text-lg font-semibold mb-3">Projections</h1>
      <ProjectionsTable rows={rows} />
    </div>
  );
}
