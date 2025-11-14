'use client';

interface BenchPlayer {
  player_id: string;
  name: string;
  projection?: { median: number } | null;
}

interface Props {
  bench: BenchPlayer[];
}

export default function BenchList({ bench }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bench</h3>
      {bench.length === 0 ? (
        <p className="text-gray-600">No bench players</p>
      ) : (
        <ul className="space-y-2">
          {bench.map((player) => (
            <li key={player.player_id} className="p-2 border rounded flex justify-between">
              <span>{player.name}</span>
              {player.projection && (
                <span className="text-sm text-gray-600">
                  {player.projection.median.toFixed(1)} pts
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
