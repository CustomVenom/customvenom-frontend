/**
 * Decision Intelligence Simulator Type Definitions
 *
 * Type-safe definitions for player comparison and decision recommendations.
 * All enhanced fields are explicitly nullable to handle missing R enhancement data.
 */

/**
 * Contextual factors that influence a projection.
 * Provided by the API layer.
 */
export interface DecisionFactor {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  description: string; // Tooltip explaining the factor
}

/**
 * The complete, enhanced data payload for a single player.
 * Null values indicate missing enhancement data (fail loudly, not silently).
 */
export interface EnhancedPlayerProjection {
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  player_image_url: string;

  // The Baseline (always present)
  projection: number;

  // The R-Powered Enhancement (nullable - we don't fake data)
  enhanced_floor: number | null;
  enhanced_ceiling: number | null;
  statistical_confidence: number | null;
  historical_games: number | null;

  // Enhancement status flag
  is_enhanced: boolean;
  enhancement_method?: 'quantile_regression' | 'fallback' | 'unavailable';

  // The API-Layer Enrichment
  factors: DecisionFactor[];
}

/**
 * The final output of the Decision Engine.
 */
export interface DecisionVerdict {
  headline: string;
  narrative: string;
  recommended_player_id: string;
  confidence_level: 'high' | 'moderate' | 'low';
  comparison_type: 'dominant' | 'safety-vs-upside' | 'toss-up' | 'standard';
}

