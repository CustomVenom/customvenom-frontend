'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayerSearch from '@/components/PlayerSearch';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import { useEnhancedProjections } from '@/hooks/use-enhanced-projections';
import { generateDecisionVerdict } from '@/lib/decision-engine';
import type { EnhancedPlayerProjection } from '@/lib/types/decision';
import { PlayerComparisonCard } from '@/components/decision-simulator/PlayerComparisonCard';
import { RecommendationCard } from '@/components/decision-simulator/RecommendationCard';
import type { Row } from '@/lib/tools';
import { useToast } from '@/components/Toast';
import { trackFeatureInteraction } from '@/lib/analytics';

function DecisionSimulatorContent() {
  const searchParams = useSearchParams();
  const { setMsg, Toast } = useToast();

  // Pre-fill from URL params (for future URL syncing)
  const [_playerA, setPlayerA] = useState(searchParams.get('playerA') || '');
  const [_playerB, setPlayerB] = useState(searchParams.get('playerB') || '');

  const [selectedPlayerA, setSelectedPlayerA] = useState<EnhancedPlayerProjection | null>(null);
  const [selectedPlayerB, setSelectedPlayerB] = useState<EnhancedPlayerProjection | null>(null);
  const [verdict, setVerdict] = useState<ReturnType<typeof generateDecisionVerdict> | null>(null);

  // Fetch enhanced projections
  const { data: projectionsData, isLoading } = useEnhancedProjections(undefined, true);

  // Convert projections to Row format for PlayerSearch compatibility
  const suggestions = useMemo(() => {
    if (!projectionsData?.data) return [];
    return projectionsData.data.projections.map((proj) => {
      // Create a Row-compatible object for PlayerSearch
      const row: Row = {
        player_id: proj.player_id,
        player_name: proj.player_name,
        team: proj.team,
        position: proj.position,
        range: {
          // Architecture Law #3: Use API-provided values only, no calculations
          // Use enhanced_floor/ceiling if available, otherwise use projection value for all bands
          // TODO: API should provide projected_points.floor/ceiling for non-enhanced projections
          p10: proj.enhanced_floor ?? proj.projection,
          p50: proj.projection,
          p90: proj.enhanced_ceiling ?? proj.projection,
        },
        confidence: proj.statistical_confidence ?? undefined,
        explanations: proj.factors.map((f) => ({
          component: f.text,
          delta_points: 0,
          confidence: 0.7,
        })),
        schema_version: 'v2.1',
        last_refresh: projectionsData.data.last_refresh || new Date().toISOString(),
      };
      return row;
    });
  }, [projectionsData]);

  // Handle player selection
  const handleSelectPlayerA = (row: Row) => {
    const proj = projectionsData?.data.projections.find((p) => p.player_id === row.player_id);
    if (proj) {
      setSelectedPlayerA(proj);
      setPlayerA(row.player_name);
    }
  };

  const handleSelectPlayerB = (row: Row) => {
    const proj = projectionsData?.data.projections.find((p) => p.player_id === row.player_id);
    if (proj) {
      setSelectedPlayerB(proj);
      setPlayerB(row.player_name);
    }
  };

  // Generate comparison
  const handleCompare = () => {
    if (!selectedPlayerA || !selectedPlayerB) {
      setMsg('Please select both players to compare.');
      return;
    }

    if (selectedPlayerA.player_id === selectedPlayerB.player_id) {
      setMsg('Please select two different players.');
      return;
    }

    // Track comparison
    trackFeatureInteraction('decision_simulator', 'compare', {
      playerA: selectedPlayerA.player_id,
      playerB: selectedPlayerB.player_id,
      has_enhancement_a: selectedPlayerA.is_enhanced,
      has_enhancement_b: selectedPlayerB.is_enhanced,
    });

    // Generate verdict
    const result = generateDecisionVerdict(selectedPlayerA, selectedPlayerB);
    setVerdict(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Decision Intelligence Simulator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare two players with advanced statistical analysis powered by R quantile regression.
          Get clear recommendations with explicit safety vs. upside trade-offs.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading projections...</p>
        </div>
      ) : (
        <>
          {/* Player Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Player A</label>
              <PlayerSearch
                rows={suggestions}
                placeholder="Search for player A..."
                onSelect={handleSelectPlayerA}
              />
              {selectedPlayerA && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: <strong>{selectedPlayerA.player_name}</strong>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Player B</label>
              <PlayerSearch
                rows={suggestions}
                placeholder="Search for player B..."
                onSelect={handleSelectPlayerB}
              />
              {selectedPlayerB && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: <strong>{selectedPlayerB.player_name}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Compare Button */}
          <div className="mb-8 text-center">
            <Button
              onClick={handleCompare}
              disabled={!selectedPlayerA || !selectedPlayerB}
              size="lg"
              className="px-8"
            >
              Compare Players
            </Button>
          </div>

          {/* Results */}
          {verdict && selectedPlayerA && selectedPlayerB && (
            <div className="space-y-8">
              {/* Recommendation */}
              <RecommendationCard verdict={verdict} />

              {/* Player Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                <PlayerComparisonCard
                  player={selectedPlayerA}
                  isWinner={verdict.recommended_player_id === selectedPlayerA.player_id}
                />
                <PlayerComparisonCard
                  player={selectedPlayerB}
                  isWinner={verdict.recommended_player_id === selectedPlayerB.player_id}
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!verdict && (
            <EmptyState
              icon={<span>📊</span>}
              title="Select Two Players to Compare"
              description="Choose two players from your league to get an intelligent comparison with statistical confidence analysis."
            />
          )}
        </>
      )}

      <Toast />
    </div>
  );
}

export default function DecisionSimulatorPage() {
  return (
    <ToolErrorBoundary>
      <DecisionSimulatorContent />
    </ToolErrorBoundary>
  );
}
