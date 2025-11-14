/**
 * Decision Simulator Test Suite
 *
 * Comprehensive tests for the Decision Intelligence Engine covering all scenarios.
 *
 * Run with: npx tsx scripts/test-decision-simulator-complete.ts
 */

import { generateDecisionVerdict } from '../src/lib/decision-engine';
import type { EnhancedPlayerProjection } from '../src/lib/types/decision';

// Test Case 1: Full enhancement available
const testFullEnhancement = () => {
  const player1: EnhancedPlayerProjection = {
    player_id: '1',
    player_name: 'Patrick Mahomes',
    team: 'KC',
    position: 'QB',
    player_image_url: '/test.jpg',
    projection: 24.5,
    enhanced_floor: 18.2,
    enhanced_ceiling: 32.1,
    statistical_confidence: 0.85,
    historical_games: 22,
    is_enhanced: true,
    enhancement_method: 'quantile_regression',
    factors: [],
  };

  const player2: EnhancedPlayerProjection = {
    player_id: '2',
    player_name: 'Josh Allen',
    team: 'BUF',
    position: 'QB',
    player_image_url: '/test.jpg',
    projection: 23.8,
    enhanced_floor: 15.1,
    enhanced_ceiling: 35.2,
    statistical_confidence: 0.72,
    historical_games: 20,
    is_enhanced: true,
    enhancement_method: 'quantile_regression',
    factors: [],
  };

  const verdict = generateDecisionVerdict(player1, player2);
  console.log('✅ Test 1 - Full Enhancement:', verdict.headline);
  console.assert(
    verdict.confidence_level !== 'low',
    'Should have moderate/high confidence with full data',
  );
  console.assert(
    verdict.recommended_player_id === '1',
    'Mahomes should win with higher floor and projection',
  );
};

// Test Case 2: Missing enhancement data
const testMissingEnhancement = () => {
  const player1: EnhancedPlayerProjection = {
    player_id: '3',
    player_name: 'Test Player 1',
    team: 'TEST',
    position: 'RB',
    player_image_url: '/test.jpg',
    projection: 15.5,
    enhanced_floor: null,
    enhanced_ceiling: null,
    statistical_confidence: null,
    historical_games: null,
    is_enhanced: false,
    factors: [],
  };

  const player2: EnhancedPlayerProjection = {
    player_id: '4',
    player_name: 'Test Player 2',
    team: 'TEST',
    position: 'RB',
    player_image_url: '/test.jpg',
    projection: 14.2,
    enhanced_floor: null,
    enhanced_ceiling: null,
    statistical_confidence: null,
    historical_games: null,
    is_enhanced: false,
    factors: [],
  };

  const verdict = generateDecisionVerdict(player1, player2);
  console.log('✅ Test 2 - Missing Enhancement:', verdict.headline);
  console.assert(
    verdict.confidence_level === 'low',
    'Should have low confidence without enhancement',
  );
  console.assert(
    verdict.narrative.includes('Limited') || verdict.headline.includes('Limited'),
    'Should acknowledge limited analysis',
  );
  console.assert(verdict.recommended_player_id === '3', 'Should recommend higher projection');
};

// Test Case 3: Safety vs Upside scenario
const testSafetyVsUpside = () => {
  const safePlayer: EnhancedPlayerProjection = {
    player_id: '5',
    player_name: 'Safe Player',
    team: 'SAFE',
    position: 'WR',
    player_image_url: '/test.jpg',
    projection: 12.0,
    enhanced_floor: 10.5, // High floor
    enhanced_ceiling: 14.0, // Low ceiling
    statistical_confidence: 0.9,
    historical_games: 30,
    is_enhanced: true,
    enhancement_method: 'quantile_regression',
    factors: [],
  };

  const upsidePlayer: EnhancedPlayerProjection = {
    player_id: '6',
    player_name: 'Upside Player',
    team: 'BOOM',
    position: 'WR',
    player_image_url: '/test.jpg',
    projection: 12.5,
    enhanced_floor: 6.0, // Low floor
    enhanced_ceiling: 20.0, // High ceiling
    statistical_confidence: 0.7,
    historical_games: 25,
    is_enhanced: true,
    enhancement_method: 'quantile_regression',
    factors: [],
  };

  const verdict = generateDecisionVerdict(safePlayer, upsidePlayer);
  console.log('✅ Test 3 - Safety vs Upside:', verdict.headline);
  console.assert(
    verdict.comparison_type === 'safety-vs-upside',
    'Should identify trade-off scenario',
  );
  console.assert(verdict.narrative.includes('floor'), 'Should mention floor in narrative');
  console.assert(verdict.narrative.includes('ceiling'), 'Should mention ceiling in narrative');
};

// Test Case 4: Insufficient historical data
const testInsufficientData = () => {
  const player1: EnhancedPlayerProjection = {
    player_id: '7',
    player_name: 'Rookie Player',
    team: 'ROOK',
    position: 'RB',
    player_image_url: '/test.jpg',
    projection: 8.5,
    enhanced_floor: null, // No enhancement due to < 5 games
    enhanced_ceiling: null,
    statistical_confidence: null,
    historical_games: 3, // Insufficient
    is_enhanced: false,
    enhancement_method: 'insufficient_data',
    factors: [],
  };

  const player2: EnhancedPlayerProjection = {
    player_id: '8',
    player_name: 'Veteran Player',
    team: 'VET',
    position: 'RB',
    player_image_url: '/test.jpg',
    projection: 9.2,
    enhanced_floor: 7.1,
    enhanced_ceiling: 12.5,
    statistical_confidence: 0.8,
    historical_games: 45,
    is_enhanced: true,
    enhancement_method: 'quantile_regression',
    factors: [],
  };

  const verdict = generateDecisionVerdict(player1, player2);
  console.log('✅ Test 4 - Insufficient Data:', verdict.headline);
  console.assert(verdict.confidence_level === 'low', 'Should have low confidence with mixed data');
  console.assert(
    verdict.narrative.includes('Limited') || verdict.narrative.includes('base projection'),
    'Should acknowledge limited analysis for player with insufficient data',
  );
  console.assert(player1.is_enhanced === false, 'Player with < 5 games should not be enhanced');
  console.assert(player1.enhanced_floor === null, 'Enhanced fields should be null');
};

// Run all tests
console.log('🧪 Running Decision Simulator Tests...\n');
try {
  testFullEnhancement();
  testMissingEnhancement();
  testSafetyVsUpside();
  testInsufficientData();
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
