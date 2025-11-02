'use client';

type UncertaintyBandProps = {
  floor: number;
  median: number;
  ceiling: number;
  confidence?: number;
  className?: string;
};

export default function UncertaintyBand({
  floor,
  median,
  ceiling,
  confidence = 0.65,
  className = '',
}: UncertaintyBandProps) {
  // Calculate range
  const range = ceiling - floor;
  const medianOffset = median - floor;

  // Color based on confidence (yellow for low, green for high)
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'bg-success';
    if (conf >= 0.7) return 'bg-primary-500';
    if (conf >= 0.65) return 'bg-warning';
    return 'bg-gray-400';
  };

  // Calculate percentages for positioning
  const medianPercent = range > 0 ? (medianOffset / range) * 100 : 50;
  const floorPercent = 0;
  const ceilingPercent = 100;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Background bar */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Uncertainty range gradient */}
        <div
          className={`h-full ${getConfidenceColor(confidence)} opacity-60`}
          style={{ width: `${ceilingPercent - floorPercent}%` }}
        />
      </div>

      {/* Floor marker */}
      <div
        className="absolute top-0 w-0.5 h-3 bg-gray-600 dark:bg-gray-400"
        style={{ left: `${floorPercent}%` }}
      />

      {/* Median marker */}
      <div
        className={`absolute top-0 w-1 h-3 ${getConfidenceColor(confidence)} rounded-full`}
        style={{ left: `calc(${medianPercent}% - 2px)` }}
      />

      {/* Ceiling marker */}
      <div
        className="absolute top-0 w-0.5 h-3 bg-gray-600 dark:bg-gray-400"
        style={{ left: `${ceilingPercent}%` }}
      />

      {/* Labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
        <span>{floor.toFixed(1)}</span>
        <span className="font-semibold">{median.toFixed(1)}</span>
        <span>{ceiling.toFixed(1)}</span>
      </div>
    </div>
  );
}
