import { type Row } from '@/lib/tools';

export function startSitSummary(
  a: Row,
  b: Row,
  risk: 'protect' | 'neutral' | 'chase',
  winner: string,
) {
  const fmt = (r: Row) =>
    `(${r.range.p10.toFixed(1)}–${r.range.p50.toFixed(1)}–${r.range.p90.toFixed(1)})`;
  return `Start ${winner} — risk ${risk}. ${a.player_name} ${fmt(a)} vs ${b.player_name} ${fmt(b)}.`;
}

export function faabSummary(name: string, min: number, likely: number, max: number) {
  return `FAAB for ${name}: min $${min}, likely $${likely}, max $${max}.`;
}
