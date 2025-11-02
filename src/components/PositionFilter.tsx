'use client';

export type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE';

type PositionFilterProps = {
  selectedPosition: Position;
  onPositionChange: (position: Position) => void;
};

const POSITIONS: Position[] = ['ALL', 'QB', 'RB', 'WR', 'TE'];

export default function PositionFilter({
  selectedPosition,
  onPositionChange,
}: PositionFilterProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Position filter">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position:</label>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => onPositionChange(pos)}
            aria-pressed={selectedPosition === pos}
            aria-label={`Filter by ${pos === 'ALL' ? 'all positions' : pos} position`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] ${
              selectedPosition === pos
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
    </div>
  );
}
