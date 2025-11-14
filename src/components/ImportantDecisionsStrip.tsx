'use client';

import { type Row } from '@/lib/tools';
import { clampChips } from '@/lib/tools';
import type { RosterPlayer } from '@/types/roster';
import type { PlayerProjection } from '@/types/projections';

type ImportantDecision = {
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  action: 'START' | 'SIT' | 'ADD' | 'DROP';
  floor: number;
  median: number;
  ceiling: number;
  confidence: number;
  explanations: Array<{ component: string; delta_points: number; confidence: number }>;
};

// New simplified decision type for roster-based decisions
type RosterDecision = {
  priority: 'CRITICAL' | 'IMPORTANT';
  message: string;
  action: string;
  playerId?: string;
  playerName?: string;
  position?: string;
};

type ImportantDecisionsStripProps = {
  decisions: ImportantDecision[];
  onDecisionClick?: (decision: ImportantDecision) => void;
  // New props for roster-based decisions
  rosterDecisions?: RosterDecision[];
};

/**
 * Get important decisions based on roster and projection data
 * Checks for empty slots, low confidence starters, and bye week conflicts
 */
export function getImportantDecisions(
  roster: { starters: RosterPlayer[]; bench?: RosterPlayer[] },
  projections: PlayerProjection[],
): RosterDecision[] {
  const decisions: RosterDecision[] = [];
  const projectionMap = new Map(projections.map((p) => [p.player_id, p]));

  // Check for bye week conflicts (CRITICAL)
  for (const starter of roster.starters) {
    const projection = projectionMap.get(starter.player_id);
    if (projection && projection.opponent === 'BYE') {
      decisions.push({
        priority: 'CRITICAL',
        message: `${starter.name || 'A starter'} is on bye this week!`,
        action: 'Replace in lineup',
        playerId: starter.player_id,
        playerName: starter.name,
        position: starter.position,
      });
    }
  }

  // Check for low confidence starters (IMPORTANT)
  for (const starter of roster.starters) {
    const projection = projectionMap.get(starter.player_id);
    if (projection && projection.confidence !== null && projection.confidence !== undefined) {
      const confidence = typeof projection.confidence === 'number' ? projection.confidence : 0;
      if (confidence < 0.5) {
        decisions.push({
          priority: 'IMPORTANT',
          message: `${starter.name || 'A starter'} is a risky start (low confidence)`,
          action: 'Consider benching',
          playerId: starter.player_id,
          playerName: starter.name,
          position: starter.position,
        });
      }
    }
  }

  // Check for empty slots (CRITICAL)
  // Group starters by position to identify missing required positions
  // Use selected_position if available (lineup slot), otherwise use position (player's actual position)
  const positionCounts = new Map<string, number>();
  for (const starter of roster.starters) {
    // Check selected_position first (lineup slot), then fall back to position
    const pos = starter.selected_position || starter.position || '';
    if (pos && pos !== 'BN' && pos !== 'IR') {
      positionCounts.set(pos, (positionCounts.get(pos) || 0) + 1);
    }
  }

  // Standard NFL positions that typically need at least 1 starter
  // This is a simplified check - actual requirements depend on league settings
  const commonPositions = ['QB', 'TE', 'K', 'DEF'];
  for (const pos of commonPositions) {
    if (!positionCounts.has(pos) || positionCounts.get(pos) === 0) {
      decisions.push({
        priority: 'CRITICAL',
        message: `Your ${pos} slot is empty!`,
        action: 'Add a player',
        position: pos,
      });
      break; // Only show one empty slot warning at a time
    }
  }

  // Return max 3 decisions, prioritizing CRITICAL
  return decisions
    .sort((a, b) => {
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
      if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL') return 1;
      return 0;
    })
    .slice(0, 3);
}

// Selection logic for Important Decisions (legacy - based on projections only)
export function selectImportantDecisions(
  rows: Row[],
  confidenceThreshold = 0.65,
): ImportantDecision[] {
  // Filter by confidence
  const candidates = rows.filter((r) => (r.confidence ?? 0) >= confidenceThreshold);

  if (candidates.length === 0) {
    return [];
  }

  // Prioritize: injury status, bye week, high volatility, waiver wire
  // For MVP: simple sort by confidence and volatility (ceiling - floor)
  const withVolatility = candidates.map((r) => ({
    ...r,
    volatility: r.range.p90 - r.range.p10,
  }));

  // Sort by confidence * volatility (high confidence + high volatility = important)
  const sorted = withVolatility.sort((a, b) => {
    const scoreA = (a.confidence ?? 0) * a.volatility;
    const scoreB = (b.confidence ?? 0) * b.volatility;
    return scoreB - scoreA;
  });

  // Determine action (simplified MVP logic)
  const decisions: ImportantDecision[] = sorted.slice(0, 5).map((r) => {
    // MVP: START if median > 15, SIT if median < 10, ADD if high ceiling, DROP if low floor
    let action: 'START' | 'SIT' | 'ADD' | 'DROP' = 'START';
    if (r.range.p50 > 15) action = 'START';
    else if (r.range.p50 < 10) action = 'SIT';
    else if (r.range.p90 > 20) action = 'ADD';
    else if (r.range.p10 < 5) action = 'DROP';

    const chips = clampChips(r.explanations, 2);

    return {
      player_id: r.player_id,
      player_name: r.player_name,
      team: r.team || '',
      position: r.position || '',
      action,
      floor: r.range.p10,
      median: r.range.p50,
      ceiling: r.range.p90,
      confidence: r.confidence ?? 0,
      explanations: chips,
    };
  });

  return decisions;
}

export default function ImportantDecisionsStrip({
  decisions,
  onDecisionClick,
  rosterDecisions,
}: ImportantDecisionsStripProps) {
  // Show roster-based decisions if available, otherwise fall back to projection-based decisions
  const hasRosterDecisions = rosterDecisions && rosterDecisions.length > 0;
  const hasProjectionDecisions = decisions && decisions.length > 0;

  if (!hasRosterDecisions && !hasProjectionDecisions) {
    return null;
  }

  // Render roster-based decisions (simplified format)
  if (hasRosterDecisions) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Important Decisions
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {rosterDecisions.length} decision{rosterDecisions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto pb-4" role="region" aria-label="Important decisions">
          <div className="flex flex-col md:flex-row gap-4 min-w-max md:min-w-0">
            {rosterDecisions.map((decision, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 w-full md:w-64 bg-white dark:bg-gray-800 border rounded-lg p-4 ${
                  decision.priority === 'CRITICAL'
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-yellow-300 dark:border-yellow-700'
                }`}
              >
                {/* Priority badge */}
                <div
                  className={`inline-block px-2 py-1 rounded text-xs font-bold mb-3 ${
                    decision.priority === 'CRITICAL'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  }`}
                >
                  {decision.priority}
                </div>

                {/* Message */}
                <div className="mb-2">
                  <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {decision.message}
                  </div>
                  {decision.position && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Position: {decision.position}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {decision.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fall back to projection-based decisions (existing format)
  if (decisions.length === 0) {
    return null;
  }

  const actionColors: Record<string, string> = {
    START: 'bg-success/10 text-success border-success/30',
    SIT: 'bg-danger/10 text-danger border-danger/30',
    ADD: 'bg-primary-100 text-primary-700 border-primary-300',
    DROP: 'bg-warning/10 text-warning border-warning/30',
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Important Decisions</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {decisions.length} decision{decisions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto pb-4" role="region" aria-label="Important decisions">
        <div className="flex flex-col md:flex-row gap-4 min-w-max md:min-w-0">
          {decisions.map((decision, idx) => (
            <button
              key={idx}
              onClick={() => onDecisionClick?.(decision)}
              aria-label={`${decision.action} ${decision.player_name} - ${decision.position} for ${decision.team}`}
              className="flex-shrink-0 w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-card hover:-translate-y-1 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[44px]"
            >
              {/* Action badge */}
              <div
                className={`inline-block px-2 py-1 rounded text-xs font-bold mb-3 ${actionColors[decision.action]}`}
              >
                {decision.action}
              </div>

              {/* Player info */}
              <div className="mb-2">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {decision.player_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {decision.position} • {decision.team}
                </div>
              </div>

              {/* Projection range */}
              <div className="mb-3 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Floor: {decision.floor.toFixed(1)}</span>
                  <span className="font-semibold">Median: {decision.median.toFixed(1)}</span>
                  <span>Ceiling: {decision.ceiling.toFixed(1)}</span>
                </div>
              </div>

              {/* Explanation chips */}
              {decision.explanations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {decision.explanations.map((chip, chipIdx) => (
                    <span
                      key={chipIdx}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                    >
                      {chip.component}
                    </span>
                  ))}
                </div>
              )}

              {/* Confidence */}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Confidence:{' '}
                {/* eslint-disable-next-line no-restricted-syntax -- Percentage formatting, not fantasy point calculation */}
                {(decision.confidence * 100).toFixed(0)}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
