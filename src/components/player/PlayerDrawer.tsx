'use client';

import { useRouter } from 'next/navigation';
import type { Projection } from '@customvenom/lib/adapters/projections-adapter';

interface Props {
  playerId?: string;
  projections: Projection[];
}

export default function PlayerDrawer({ playerId, projections }: Props) {
  const router = useRouter();

  if (!playerId) return null;

  const player = projections.find((p) => p.playerId === playerId);
  if (!player) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-800 shadow-lg z-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{player.name}</h3>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-sm text-gray-600">{player.team}</span>
          <span className="mx-2">•</span>
          <span className="text-sm text-gray-600">{player.position}</span>
          {player.opponent && (
            <>
              <span className="mx-2">•</span>
              <span className="text-sm text-gray-600">vs {player.opponent}</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Floor</div>
            <div className="text-lg font-semibold">{player.floor.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Median</div>
            <div className="text-lg font-semibold">{player.median.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Ceiling</div>
            <div className="text-lg font-semibold">{player.ceiling.toFixed(1)}</div>
          </div>
        </div>
        {player.chips.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Venom Chips</h4>
            <div className="space-y-2">
              {player.chips.map((chip, i) => (
                <div key={i} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="text-sm">{chip.label}</div>
                  <div className="text-xs text-gray-600">
                    {chip.delta_pct >= 0 ? '+' : ''}
                    {chip.delta_pct.toFixed(1)}% • {Math.round(chip.confidence * 100)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="text-sm text-gray-600">Confidence</div>
          <div className="text-lg font-semibold">{Math.round(player.confidence * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
