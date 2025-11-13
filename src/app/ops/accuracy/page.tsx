'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface AccuracyMetric {
  id: string;
  sport: string;
  position: string | null;
  week: number;
  season: number;
  model_version: string;
  total_predictions: number;
  hit_rate: number;
  mean_absolute_error: number;
  mean_error: number;
  rmse: number;
  avg_confidence: number;
  calibration_score: number;
  high_confidence_hit_rate: number | null;
  medium_confidence_hit_rate: number | null;
  low_confidence_hit_rate: number | null;
  calculated_at: number;
}

interface AccuracyData {
  metrics: AccuracyMetric[];
  count: number;
}

export default function AccuracyDashboard() {
  const [data, setData] = useState<AccuracyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    position: '',
    weekStart: '',
    weekEnd: '',
    season: new Date().getFullYear().toString(),
  });

  const fetchAccuracyMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
      const params = new URLSearchParams();

      if (filters.sport) params.append('sport', filters.sport);
      if (filters.position) params.append('position', filters.position);
      if (filters.weekStart) params.append('week_start', filters.weekStart);
      if (filters.weekEnd) params.append('week_end', filters.weekEnd);
      if (filters.season) params.append('season', filters.season);

      const response = await fetch(`${apiBase}/api/feedback/accuracy?${params.toString()}`);
      const result = await response.json();

      if (result.ok) {
        setData(result);
      } else {
        console.error('Failed to fetch accuracy metrics:', result);
      }
    } catch (error) {
      console.error('Error fetching accuracy metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAccuracyMetrics();
  }, [fetchAccuracyMetrics]);

  // Calculate overall metrics
  const overallMetrics = data?.metrics?.reduce(
    (acc, m) => {
      acc.totalPredictions += m.total_predictions;
      acc.totalHits += m.hit_rate * m.total_predictions;
      acc.totalMAE += m.mean_absolute_error * m.total_predictions;
      acc.totalRMSE += m.rmse * m.total_predictions;
      acc.totalCalibration += m.calibration_score * m.total_predictions;
      return acc;
    },
    {
      totalPredictions: 0,
      totalHits: 0,
      totalMAE: 0,
      totalRMSE: 0,
      totalCalibration: 0,
    },
  ) || {
    totalPredictions: 0,
    totalHits: 0,
    totalMAE: 0,
    totalRMSE: 0,
    totalCalibration: 0,
  };

  const overallHitRate =
    overallMetrics.totalPredictions > 0
      ? (overallMetrics.totalHits / overallMetrics.totalPredictions) * 100
      : 0;
  const overallMAE =
    overallMetrics.totalPredictions > 0
      ? overallMetrics.totalMAE / overallMetrics.totalPredictions
      : 0;
  const overallRMSE =
    overallMetrics.totalPredictions > 0
      ? overallMetrics.totalRMSE / overallMetrics.totalPredictions
      : 0;
  const overallCalibration =
    overallMetrics.totalPredictions > 0
      ? overallMetrics.totalCalibration / overallMetrics.totalPredictions
      : 0;

  // Group by position
  const byPosition: Record<string, AccuracyMetric[]> = {};
  data?.metrics?.forEach((m) => {
    const pos = m.position || 'ALL';
    if (!byPosition[pos]) {
      byPosition[pos] = [];
    }
    byPosition[pos].push(m);
  });

  // Get latest week metrics
  const latestWeek = data?.metrics?.length ? Math.max(...(data?.metrics?.map((m) => m.week) || [])) : null;
  const latestWeekMetrics = data?.metrics?.filter((m) => m.week === latestWeek) || [];

  // Get 4-week rolling average
  const recentWeeks = data?.metrics?.sort((a, b) => b.week - a.week).slice(0, 4) || [];
  const fourWeekHitRate =
    recentWeeks.length > 0
      ? (recentWeeks.reduce((sum, m) => sum + m.hit_rate * m.total_predictions, 0) /
          recentWeeks.reduce((sum, m) => sum + m.total_predictions, 0)) *
        100
      : 0;

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="text-center text-xl text-gray-600 py-10">Loading accuracy dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 m-0">Accuracy Dashboard</h1>
        <span className="text-lg text-gray-600 mt-2 block">Prediction Performance Metrics</span>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sport</label>
            <select
              value={filters.sport}
              onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
            >
              <option value="">All</option>
              <option value="nfl">NFL</option>
              <option value="nba">NBA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select
              value={filters.position}
              onChange={(e) => setFilters({ ...filters, position: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
            >
              <option value="">All</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Week Start</label>
            <input
              type="number"
              value={filters.weekStart}
              onChange={(e) => setFilters({ ...filters, weekStart: e.target.value })}
              placeholder="1"
              className="w-full px-3 py-2 rounded-lg border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Week End</label>
            <input
              type="number"
              value={filters.weekEnd}
              onChange={(e) => setFilters({ ...filters, weekEnd: e.target.value })}
              placeholder="18"
              className="w-full px-3 py-2 rounded-lg border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Season</label>
            <input
              type="number"
              value={filters.season}
              onChange={(e) => setFilters({ ...filters, season: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
            />
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Overall Hit Rate</div>
          <div className="text-3xl font-bold">{overallHitRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {latestWeek && `Week ${latestWeek}: ${fourWeekHitRate.toFixed(1)}%`}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Mean Absolute Error</div>
          <div className="text-3xl font-bold">{overallMAE.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">points</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">RMSE</div>
          <div className="text-3xl font-bold">{overallRMSE.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">points</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Calibration Score</div>
          <div className="text-3xl font-bold">{overallCalibration.toFixed(3)}</div>
          <div className="text-xs text-gray-500 mt-1">0-1 scale</div>
        </div>
      </div>

      {/* Hit Rate by Position */}
      {Object.keys(byPosition).length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Hit Rate by Position</h3>
          <div className="space-y-3">
            {Object.entries(byPosition).map(([position, metrics]) => {
              const totalPred = metrics.reduce((sum, m) => sum + m.total_predictions, 0);
              const totalHits = metrics.reduce(
                (sum, m) => sum + m.hit_rate * m.total_predictions,
                0,
              );
              const hitRate = totalPred > 0 ? (totalHits / totalPred) * 100 : 0;
              return (
                <div key={position} className="flex items-center justify-between">
                  <span className="font-medium">{position}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          hitRate >= 75
                            ? 'bg-green-500'
                            : hitRate >= 65
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, hitRate)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-16 text-right">
                      {hitRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Week Metrics Table */}
      {latestWeekMetrics.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Week {latestWeek} Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Sport</th>
                  <th className="text-left p-2">Position</th>
                  <th className="text-right p-2">Predictions</th>
                  <th className="text-right p-2">Hit Rate</th>
                  <th className="text-right p-2">MAE</th>
                  <th className="text-right p-2">RMSE</th>
                  <th className="text-right p-2">Calibration</th>
                </tr>
              </thead>
              <tbody>
                {latestWeekMetrics.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-2">{m.sport.toUpperCase()}</td>
                    <td className="p-2">{m.position || 'ALL'}</td>
                    <td className="text-right p-2">{m.total_predictions}</td>
                    <td className="text-right p-2">{(m.hit_rate * 100).toFixed(1)}%</td>
                    <td className="text-right p-2">{m.mean_absolute_error.toFixed(2)}</td>
                    <td className="text-right p-2">{m.rmse.toFixed(2)}</td>
                    <td className="text-right p-2">{m.calibration_score.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confidence Buckets */}
      {data?.metrics?.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Hit Rate by Confidence Bucket</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">High (&gt;0.8)</div>
              <div className="text-2xl font-bold">
                {data?.metrics
                  ?.filter((m) => m.high_confidence_hit_rate !== null)
                  .reduce((sum, m) => sum + (m.high_confidence_hit_rate || 0), 0) /
                  (data?.metrics?.filter((m) => m.high_confidence_hit_rate !== null).length || 1) || 0}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Medium (0.5-0.8)</div>
              <div className="text-2xl font-bold">
                {data?.metrics
                  ?.filter((m) => m.medium_confidence_hit_rate !== null)
                  .reduce((sum, m) => sum + (m.medium_confidence_hit_rate || 0), 0) /
                  (data?.metrics?.filter((m) => m.medium_confidence_hit_rate !== null).length || 1) || 0}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Low (&lt;0.5)</div>
              <div className="text-2xl font-bold">
                {data?.metrics
                  ?.filter((m) => m.low_confidence_hit_rate !== null)
                  .reduce((sum, m) => sum + (m.low_confidence_hit_rate || 0), 0) /
                  (data?.metrics?.filter((m) => m.low_confidence_hit_rate !== null).length || 1) || 0}
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!data || (data.metrics?.length ?? 0) === 0) && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Metrics Available</h3>
          <p className="text-gray-600">
            Accuracy metrics will appear here once predictions are stored and actuals are fetched.
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link href="/ops" className="cv-btn-ghost">
          Back to Ops
        </Link>
        <button onClick={fetchAccuracyMetrics} className="cv-btn-ghost" disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>
    </div>
  );
}
