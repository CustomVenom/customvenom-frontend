import { type Row } from '@/lib/tools';

export function pickExamples(rows: Row[], n = 2): Row[] {
  // Choose top N players with distinct positions if possible
  const sorted = [...rows].sort((a, b) => (b.expected_points ?? 0) - (a.expected_points ?? 0));
  const results: Row[] = [];
  
  for (const row of sorted) {
    if (results.length >= n) break;
    if (!results.some(r => r.player_name === row.player_name)) {
      results.push(row);
    }
  }
  
  return results;
}

