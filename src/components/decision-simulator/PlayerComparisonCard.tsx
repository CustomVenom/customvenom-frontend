'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EnhancedPlayerProjection } from '@/lib/types/decision';

interface PlayerComparisonCardProps {
  player: EnhancedPlayerProjection;
  isWinner: boolean;
}

export function PlayerComparisonCard({ player, isWinner }: PlayerComparisonCardProps) {
  // Handle missing enhancement gracefully
  if (!player.is_enhanced) {
    return (
      <Card
        className={cn('p-6 bg-gray-900 border', isWinner ? 'border-blue-500' : 'border-gray-800')}
      >
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={player.player_image_url}
            alt={player.player_name}
            className="h-14 w-14 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/player-image/default';
            }}
          />
          <div>
            <h3 className="text-xl font-bold">{player.player_name}</h3>
            <p className="text-sm text-gray-400">
              {player.team} - {player.position}
            </p>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-5xl font-black tabular-nums">{player.projection.toFixed(1)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Base Projection</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-3">
          <p className="text-sm text-yellow-400">
            ⚠️ Enhanced analysis unavailable. Showing base projection only.
          </p>
        </div>

        {player.factors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Available Context</p>
            <div className="flex flex-wrap gap-1">
              {player.factors.slice(0, 3).map((factor, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {factor.text}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Full enhanced display
  const range = player.enhanced_ceiling! - player.enhanced_floor!;
  const volatility = range > 0 ? range / player.projection : 1;
  const projectionPosition =
    range > 0 ? ((player.projection - player.enhanced_floor!) / range) * 100 : 50;

  return (
    <Card
      className={cn(
        'p-6 bg-gray-900 border',
        isWinner ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-800',
      )}
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={player.player_image_url}
          alt={player.player_name}
          className="h-14 w-14 rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/api/player-image/default';
          }}
        />
        <div>
          <h3 className="text-xl font-bold">{player.player_name}</h3>
          <p className="text-sm text-gray-400">
            {player.team} - {player.position}
          </p>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-5xl font-black tabular-nums">{player.projection.toFixed(1)}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Projection</p>
      </div>

      {/* Enhanced Range Visualization */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Floor: {player.enhanced_floor!.toFixed(1)}</span>
          <span>Ceiling: {player.enhanced_ceiling!.toFixed(1)}</span>
        </div>
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ width: `${projectionPosition}%` }}
          />
          <div
            className="absolute h-full bg-gray-700 opacity-50"
            style={{ left: `${projectionPosition}%`, width: `${100 - projectionPosition}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Range: {range.toFixed(1)} pts ({(volatility * 100).toFixed(0)}% volatility)
        </div>
      </div>

      {/* Confidence Indicator */}
      {player.statistical_confidence !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Statistical Confidence</span>
            <Badge variant="venom" className="text-xs">
              {/* eslint-disable-next-line no-restricted-syntax -- Percentage formatting, not fantasy point calculation */}
              {(player.statistical_confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-venom-500"
              // eslint-disable-next-line no-restricted-syntax -- Percentage formatting for bar width, not fantasy point calculation
              style={{ width: `${player.statistical_confidence * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Based on {player.historical_games} historical games
          </div>
        </div>
      )}

      {/* Context Factors */}
      {player.factors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Factors</p>
          <div className="flex flex-wrap gap-1">
            {player.factors.slice(0, 3).map((factor, i) => (
              <Badge
                key={i}
                variant={factor.sentiment === 'positive' ? 'venom' : 'secondary'}
                className="text-xs"
              >
                {factor.text}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
