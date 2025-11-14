'use client';

interface Starter {
  player_id: string;
  name: string;
  selected_position: string;
  projection?: { median: number } | null;
}

interface Props {
  starters: Starter[];
}

export default function StarterGrid({ starters }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Starters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {starters.map((starter) => (
          <div key={starter.player_id} className="p-4 border rounded">
            <div className="font-medium">{starter.name}</div>
            <div className="text-sm text-gray-600">{starter.selected_position}</div>
            {starter.projection && (
              <div className="text-sm">Projected: {starter.projection.median.toFixed(1)} pts</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
