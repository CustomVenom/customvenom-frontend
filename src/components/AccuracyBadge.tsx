'use client';

import { useQuery } from '@tanstack/react-query';

interface AccuracyMetrics {
  total_predictions: number;
  predictions_with_results: number;
  floor_hit_rate: number;
  median_mae: number;
  ceiling_hit_rate: number;
  in_range_rate: number;
  average_confidence: number;
}

interface AccuracyResponse {
  sport: string;
  period: string;
  by_source?: Record<string, AccuracyMetrics>;
  metrics?: AccuracyMetrics;
  cached?: boolean;
}

interface AccuracyBadgeProps {
  sport: 'nba' | 'nfl';
  source?: 'prophet' | 'mvp' | 'blended';
}

export function AccuracyBadge({ sport, source }: AccuracyBadgeProps) {
  const { data, isLoading } = useQuery<AccuracyResponse>({
    queryKey: ['accuracy', sport, source],
    queryFn: async () => {
      const base = process.env['NEXT_PUBLIC_API_BASE'] || '';
      const url = source
        ? `${base}/api/accuracy/${sport}?source=${source}&days=7`
        : `${base}/api/accuracy/${sport}?days=7`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch accuracy metrics');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Get metrics - either from by_source or direct metrics
  let metrics: AccuracyMetrics | undefined;
  if (source && data.metrics) {
    metrics = data.metrics;
  } else if (data.by_source) {
    // Show combined or first available source
    metrics = data.by_source[source || 'prophet'] || Object.values(data.by_source)[0];
  }

  if (!metrics || metrics.total_predictions === 0) {
    return null;
  }

  const { floor_hit_rate, median_mae, ceiling_hit_rate, in_range_rate } = metrics;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Last 7 Days Performance
        {source && <span className="ml-2 text-xs text-gray-500">({source})</span>}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-gray-500 dark:text-gray-400 mb-1">Floor Hit</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {(floor_hit_rate * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Target: ~90%</div>
        </div>

        <div>
          <div className="text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ±{median_mae.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Points off</div>
        </div>

        <div>
          <div className="text-gray-500 dark:text-gray-400 mb-1">Ceiling Hit</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {(ceiling_hit_rate * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Target: ~10%</div>
        </div>

        <div>
          <div className="text-gray-500 dark:text-gray-400 mb-1">In Range</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {(in_range_rate * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Floor-Ceiling</div>
        </div>
      </div>

      {data.by_source && Object.keys(data.by_source).length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">By Source:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(data.by_source).map(([src, srcMetrics]) => (
              <div key={src} className="text-center">
                <div className="font-medium text-gray-700 dark:text-gray-300 capitalize">{src}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  MAE: {srcMetrics.median_mae.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
