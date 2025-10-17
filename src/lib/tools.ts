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

/**
 * Fetch projections data for search/autocomplete
 * Uses mock data for now - wire to API when ready
 */
export async function fetchProjections(week: string = '2025-06'): Promise<Row[]> {
  try {
    // TODO: Wire to actual API
    // const response = await fetch(`/api/projections?week=${week}`);
    // const data = await response.json();
    // return data.projections;
    
    // Mock data for development
    return [
      {
        player_id: 'patrick_mahomes',
        player_name: 'Patrick Mahomes',
        team: 'KC',
        position: 'QB',
        range: { p10: 18.2, p50: 22.5, p90: 28.1 },
        explanations: [
          { component: 'Usage ↑', delta_points: 0.021, confidence: 0.72 },
        ],
        schema_version: 'v1',
        last_refresh: new Date().toISOString(),
      },
      {
        player_id: 'jalen_hurts',
        player_name: 'Jalen Hurts',
        team: 'PHI',
        position: 'QB',
        range: { p10: 19.5, p50: 24.2, p90: 29.8 },
        explanations: [
          { component: 'Rushing upside', delta_points: 0.032, confidence: 0.75 },
        ],
        schema_version: 'v1',
        last_refresh: new Date().toISOString(),
      },
      {
        player_id: 'ceedee_lamb',
        player_name: 'CeeDee Lamb',
        team: 'DAL',
        position: 'WR',
        range: { p10: 12.5, p50: 16.8, p90: 21.3 },
        explanations: [
          { component: 'Target share ↑', delta_points: 0.028, confidence: 0.78 },
        ],
        schema_version: 'v1',
        last_refresh: new Date().toISOString(),
      },
      {
        player_id: 'jahmyr_gibbs',
        player_name: 'Jahmyr Gibbs',
        team: 'DET',
        position: 'RB',
        range: { p10: 14.2, p50: 18.5, p90: 24.1 },
        explanations: [
          { component: 'Usage stable', delta_points: 0.012, confidence: 0.71 },
        ],
        schema_version: 'v1',
        last_refresh: new Date().toISOString(),
      },
      {
        player_id: 'garrett_wilson',
        player_name: 'Garrett Wilson',
        team: 'NYJ',
        position: 'WR',
        range: { p10: 10.8, p50: 14.2, p90: 18.9 },
        explanations: [
          { component: 'QB downgrade', delta_points: -0.015, confidence: 0.69 },
        ],
        schema_version: 'v1',
        last_refresh: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error('Failed to fetch projections for search:', error);
    return [];
  }
}

