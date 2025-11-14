'use client';

interface EnrichedPlayer {
  player_id: string;
  name: string;
  selected_position?: string;
  projection?: { median: number } | null;
}

interface Props {
  enriched: EnrichedPlayer[];
  teamKey?: string;
  riskProfile?: 'protect' | 'neutral' | 'chase';
}

export default function OptimizerWidget({ teamKey }: Props) {
  return (
    <div className="mt-6 p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Lineup Optimizer</h3>
      {teamKey ? (
        <p className="text-sm text-gray-600">Optimizer suggestions will appear here</p>
      ) : (
        <p className="text-sm text-gray-600">
          Connect your Yahoo account to see lineup suggestions
        </p>
      )}
    </div>
  );
}
