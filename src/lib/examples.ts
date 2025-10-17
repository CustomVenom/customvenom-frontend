import { type Row } from '@/lib/tools';

export function pickExamples(rows: Row[], n = 2): Row[] {
  // Choose two popular names with distinct positions if possible
  const sorted = [...rows].sort((a, b) => (b.expected_points ?? 0) - (a.expected_points ?? 0));
  const first = sorted[0];
  const second = sorted.find(r => r.player_name !== first?.player_name) || sorted[1];
  return [first, second].filter(Boolean) as Row[];
}

