import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ConfidenceDecayBadge } from '@/components/ConfidenceDecayBadge';
import { ExplanationChips } from '@/components/ExplanationChips';
import { ProjectionRibbon } from '@/components/ProjectionRibbon';
import type { Reason } from '@/lib/types';

interface PlayerProjectionCardProps {
  player: {
    name: string;
    position: string;
    team: string;
    projected_points: {
      floor: number;
      median: number;
      ceiling: number;
    };
    confidence: number;
    explanations: Reason[];
    confidence_metadata?: {
      original_confidence: number;
      decay_applied: number;
      expires_in_hours: number;
    };
  };
}

export function PlayerProjectionCard({ player }: PlayerProjectionCardProps) {
  const { projected_points: projectedPoints } = player;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900 transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{player.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {player.position} • {player.team}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {projectedPoints.median.toFixed(1)}
            </span>
            <ConfidenceIndicator confidence={player.confidence} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">projected pts</p>
          {player.confidence_metadata && player.confidence_metadata.decay_applied > 0 && (
            <ConfidenceDecayBadge
              confidence={player.confidence}
              decayMetadata={player.confidence_metadata}
            />
          )}
        </div>
      </div>

      {player.explanations.length > 0 && <ExplanationChips explanations={player.explanations} />}

      <ProjectionRibbon
        floor={projectedPoints.floor}
        median={projectedPoints.median}
        ceiling={projectedPoints.ceiling}
      />
    </div>
  );
}
