interface ProjectionRibbonProps {
  floor: number;
  median: number;
  ceiling: number;
}

export function ProjectionRibbon({ floor, median, ceiling }: ProjectionRibbonProps) {
  const range = Math.max(ceiling - floor, 0.0001);
  const medianPercent = Math.min(Math.max(((median - floor) / range) * 100, 0), 100);

  return (
    <div className="w-full mt-3">
      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
        <span>Floor: {floor.toFixed(1)}</span>
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          Median: {median.toFixed(1)}
        </span>
        <span>Ceiling: {ceiling.toFixed(1)}</span>
      </div>

      <div className="relative w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-blue-500 to-green-400 opacity-60" />
        <div
          className="absolute top-0 bottom-0 w-1 bg-white dark:bg-gray-900 border border-gray-900 dark:border-white"
          style={{ left: `${medianPercent}%`, transform: 'translateX(-50%)' }}
          aria-hidden
        />
      </div>
    </div>
  );
}

