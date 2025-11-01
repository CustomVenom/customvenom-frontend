'use client';

export type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE';

type PositionFilterProps = {
  selectedPosition: Position;
  onPositionChange: (position: Position) => void;
};

const POSITIONS: Position[] = ['ALL', 'QB', 'RB', 'WR', 'TE'];

export default function PositionFilter({ selectedPosition, onPositionChange }: PositionFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position:</label>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => onPositionChange(pos)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedPosition === pos
                ? 'bg-[#667eea] text-white shadow-sm'
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

