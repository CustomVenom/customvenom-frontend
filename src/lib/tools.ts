// Tools utilities and types

export interface Row {
  player_id: string;
  player_name?: string;
  team?: string;
  position?: string;
  range: {
    p10: number;  // Floor
    p50: number;  // Median
    p90: number;  // Ceiling
  };
  explanations?: Array<{
    component: string;
    delta_points: number;
    confidence: number;
  }>;
  schema_version: string;
  last_refresh: string;
}

export interface ChipDisplay {
  component: string;
  delta_points: number;
  confidence: number;
}

/**
 * Clamp chips for display:
 * - Filter by confidence >= 0.65
 * - Sort by |delta_points| desc
 * - Keep max 2
 */
export function clampChips(explanations?: Row['explanations']): ChipDisplay[] {
  if (!explanations || explanations.length === 0) return [];
  
  const eligible = explanations
    .filter(e => e.confidence >= 0.65)
    .sort((a, b) => Math.abs(b.delta_points) - Math.abs(a.delta_points));
  
  return eligible.slice(0, 2);
}

