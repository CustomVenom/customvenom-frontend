// Unified PlayerCard component - works in all contexts (My Team, Players, Start/Sit, Matchup)
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExplanationChips } from '@/components/ExplanationChips';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import type { Reason } from '@/lib/types';

interface PlayerCardProps {
  player: {
    name: string;
    team: string;
    position: string;
    opponent: string | null;
    projection: {
      floor: number;
      median: number;
      ceiling: number;
    };
    chips: Reason[]; // Max 2 chips with confidence >= 0.65
    confidence: number;
  };
  mode?: 'compact' | 'detailed' | 'comparison';
  onTrade?: () => void;
  onDetails?: () => void;
  onAdd?: () => void;
  onDrop?: () => void;
}

export function PlayerCard({
  player,
  mode = 'compact',
  onTrade,
  onDetails,
  onAdd,
  onDrop,
}: PlayerCardProps) {
  // Filter chips: max 2, confidence >= 0.65
  const visibleChips = player.chips.filter((chip) => chip.confidence >= 0.65).slice(0, 2);

  const isCompact = mode === 'compact';

  return (
    <Card className={isCompact ? 'p-3' : 'p-4'}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-lg">{player.name}</span>
            <Badge variant="outline">{player.position}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {player.team} {player.opponent ? `vs ${player.opponent}` : ''}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{player.projection.median.toFixed(1)}</span>
            <ConfidenceIndicator confidence={player.confidence} />
          </div>
          <div className="text-xs text-muted-foreground">Median</div>
        </div>
      </div>

      {/* Floor/Ceiling display */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <div>
            <div className="font-medium">{player.projection.floor.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Floor</div>
          </div>
          <div>
            <div className="font-medium">{player.projection.ceiling.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Ceiling</div>
          </div>
        </div>
      </div>

      {/* Reason chips */}
      {visibleChips.length > 0 && (
        <div className="mt-3">
          <ExplanationChips explanations={visibleChips} />
        </div>
      )}

      {/* Actions (not shown in compact mode) */}
      {!isCompact && (onTrade || onDetails || onAdd || onDrop) && (
        <div className="mt-4 flex gap-2">
          {onDetails && (
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={onDetails}
              type="button"
            >
              View Details
            </button>
          )}
          {onTrade && (
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={onTrade}
              type="button"
            >
              Trade
            </button>
          )}
          {onAdd && (
            <button
              className="text-sm text-green-500 hover:underline"
              onClick={onAdd}
              type="button"
            >
              Add
            </button>
          )}
          {onDrop && (
            <button className="text-sm text-red-500 hover:underline" onClick={onDrop} type="button">
              Drop
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
