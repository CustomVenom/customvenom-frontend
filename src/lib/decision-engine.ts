/**
 * Decision Intelligence Engine
 *
 * Generates sophisticated player comparison recommendations using R-enhanced projection data.
 * Handles graceful degradation when enhancement data is unavailable.
 */

import { EnhancedPlayerProjection, DecisionVerdict } from './types/decision';

/**
 * Calculates a holistic "Decision Score" for a player.
 * Returns null if enhancement data is missing (we don't guess).
 */
function calculateDecisionScore(player: EnhancedPlayerProjection): number | null {
  // Can't calculate without enhancement data
  if (!player.is_enhanced || player.enhanced_floor === null || player.enhanced_ceiling === null) {
    return null;
  }

  let score = player.projection;

  // Weight by statistical confidence
  const confidence = player.statistical_confidence || 0.5;
  score *= 0.8 + confidence * 0.4; // Scale to 0.8-1.2 multiplier

  // Adjust for volatility
  const range = player.enhanced_ceiling - player.enhanced_floor;
  const volatility_ratio = range > 0 ? range / player.projection : 1;

  if (volatility_ratio < 0.4) {
    score *= 1.05; // 5% bonus for steady players
  } else if (volatility_ratio > 0.8) {
    score *= 0.97; // 3% penalty for boom/bust players
  }

  return score;
}

/**
 * The core function with enhanced safety vs. upside logic.
 */
export function generateDecisionVerdict(
  playerA: EnhancedPlayerProjection,
  playerB: EnhancedPlayerProjection,
): DecisionVerdict {
  // Handle missing enhancement data gracefully
  if (!playerA.is_enhanced || !playerB.is_enhanced) {
    const higherProjection = playerA.projection > playerB.projection ? playerA : playerB;
    return {
      headline: `Limited Analysis Available`,
      narrative: `Without complete statistical enhancement, we can only compare base projections. ${higherProjection.player_name} projects higher at ${higherProjection.projection.toFixed(1)} points. Consider other factors like matchups and recent form for your decision.`,
      recommended_player_id: higherProjection.player_id,
      confidence_level: 'low',
      comparison_type: 'standard',
    };
  }

  // Safe type assertion after null checks
  const scoreA = calculateDecisionScore(playerA)!;
  const scoreB = calculateDecisionScore(playerB)!;

  // Identify safety and upside independently
  const saferPlayer = playerA.enhanced_floor! > playerB.enhanced_floor! ? playerA : playerB;
  const unsaferPlayer = saferPlayer.player_id === playerA.player_id ? playerB : playerA;

  const upsidePlayer = playerA.enhanced_ceiling! > playerB.enhanced_ceiling! ? playerA : playerB;
  const lowerUpsidePlayer = upsidePlayer.player_id === playerA.player_id ? playerB : playerA;

  const winner = scoreA > scoreB ? playerA : playerB;
  const loser = scoreA > scoreB ? playerB : playerA;

  // Case 1: Pure Dominance
  if (
    winner.projection > loser.projection &&
    winner.enhanced_floor! > loser.enhanced_floor! &&
    winner.enhanced_ceiling! > loser.enhanced_ceiling!
  ) {
    return {
      headline: `Clear Winner: ${winner.player_name}`,
      narrative: `${winner.player_name} dominates across all metrics with a higher projection (${winner.projection.toFixed(1)}), safer floor (${winner.enhanced_floor!.toFixed(1)}), and greater ceiling (${winner.enhanced_ceiling!.toFixed(1)}). This is an easy decision.`,
      recommended_player_id: winner.player_id,
      confidence_level: 'high',
      comparison_type: 'dominant',
    };
  }

  // Case 2: Classic Safety vs. Upside Trade-off
  if (saferPlayer.player_id !== upsidePlayer.player_id) {
    const scoreDiff = Math.abs(scoreA - scoreB) / Math.max(scoreA, scoreB);
    const recommendation = scoreDiff > 0.1 ? winner : saferPlayer; // Lean safe if close

    return {
      headline: `Classic Choice: Safety vs. Upside`,
      narrative: `${saferPlayer.player_name} offers the safer floor (${saferPlayer.enhanced_floor!.toFixed(1)} vs ${unsaferPlayer.enhanced_floor!.toFixed(1)}), while ${upsidePlayer.player_name} provides higher ceiling potential (${upsidePlayer.enhanced_ceiling!.toFixed(1)} vs ${lowerUpsidePlayer.enhanced_ceiling!.toFixed(1)}). ${
        recommendation.player_id === saferPlayer.player_id
          ? `We recommend the safer play in ${saferPlayer.player_name} unless you need the ceiling.`
          : `We recommend ${upsidePlayer.player_name} for the upside, but ${saferPlayer.player_name} is viable if you're protecting a lead.`
      }`,
      recommended_player_id: recommendation.player_id,
      confidence_level: scoreDiff > 0.15 ? 'high' : 'moderate',
      comparison_type: 'safety-vs-upside',
    };
  }

  // Case 3: Statistical Toss-up
  const scoreDiff = Math.abs(scoreA - scoreB) / Math.max(scoreA, scoreB);
  if (scoreDiff < 0.05) {
    const moreConfident =
      playerA.statistical_confidence! > playerB.statistical_confidence! ? playerA : playerB;
    const lessConfident = moreConfident.player_id === playerA.player_id ? playerB : playerA;

    return {
      headline: `Too Close to Call`,
      narrative: `Both players project nearly identically. ${moreConfident.player_name} gets a slight edge with ${(moreConfident.statistical_confidence! * 100).toFixed(0)}% statistical confidence based on ${moreConfident.historical_games} historical games versus ${lessConfident.player_name}'s ${(lessConfident.statistical_confidence! * 100).toFixed(0)}% confidence. Either choice is defensible.`,
      recommended_player_id: moreConfident.player_id,
      confidence_level: 'low',
      comparison_type: 'toss-up',
    };
  }

  // Default Case: Clear but not dominant winner
  return {
    headline: `The Smart Play: ${winner.player_name}`,
    narrative: `Our analysis gives ${winner.player_name} a clear edge with a ${(scoreDiff * 100).toFixed(0)}% scoring advantage. The combination of projection (${winner.projection.toFixed(1)}), floor (${winner.enhanced_floor!.toFixed(1)}), and ${winner.statistical_confidence! > loser.statistical_confidence! ? 'higher statistical confidence' : 'favorable matchup factors'} makes this the recommended choice.`,
    recommended_player_id: winner.player_id,
    confidence_level: scoreDiff > 0.15 ? 'high' : 'moderate',
    comparison_type: 'standard',
  };
}
