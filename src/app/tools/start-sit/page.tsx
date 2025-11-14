'use client';

import StartSitForm from '@/components/start-sit/StartSitForm';
import ComparisonPanel from '@/components/start-sit/ComparisonPanel';
import { useSearchParams } from 'next/navigation';
import { useProjections } from '@customvenom/lib/hooks/useProjections';

export default function StartSitPage() {
  const params = useSearchParams();
  const week = params.get('week') ?? '2025-11';
  const sport = (params.get('sport') ?? 'nfl') as 'nfl' | 'nba';
  const preA = params.get('playerA') ?? undefined;
  const preB = params.get('playerB') ?? undefined;
  const risk = (params.get('risk') ?? 'neutral') as 'protect' | 'neutral' | 'chase';

  const { data, isLoading, error } = useProjections({ week, sport });

  if (isLoading) return <div className="table-scroll">{/*skeleton*/}</div>;
  if (error) return <div className="table-scroll">{/*error state*/}</div>;

  return (
    <div className="table-scroll">
      <StartSitForm dataset={data!.projections} preA={preA} preB={preB} preRisk={risk} />
      <ComparisonPanel dataset={data!.projections} />
    </div>
  );
}
