'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { SportRegistry } from '@/lib/sports/registry';
import { Sport, ProjectionResponse } from '@/lib/sports/base/SportClient';
import ProjectionsTable from '@/components/ProjectionsTable';
import WeekSelector from '@/components/WeekSelector';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { AccuracyBadge } from '@/components/AccuracyBadge';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { type Row } from '@/lib/tools';

export default function SportProjectionsPage() {
  const params = useParams();
  const sport = (params['sport'] || 'nfl') as Sport;

  const [projections, setProjections] = useState<ProjectionResponse | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoringFormat, setScoringFormat] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('2025-10');

  const client = SportRegistry.get(sport);

  // Validate sport
  if (!client || (sport !== 'nfl' && sport !== 'nba')) {
    notFound();
  }

  // Initialize scoring format
  useEffect(() => {
    if (!scoringFormat && client) {
      setScoringFormat(client.getDefaultScoringFormat());
    }
  }, [client, scoringFormat]);

  // Fetch projections
  useEffect(() => {
    if (!scoringFormat || !client) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await client.fetchProjections({
          week: selectedWeek,
          scoringFormat,
        });

        if (!cancelled) {
          setProjections(data);

          // Map projections to rows for ProjectionsTable
          const mappedRows = data.projections.map((proj) => {
            // Extract explanation text and parse delta if possible
            const explanations = proj.explanations.map((text: string) => {
              // Try to parse delta from explanation text
              const pointsMatch = text.match(/[+-](\d+\.?\d*)\s?pts?/i);
              const percentMatch = text.match(/[+-](\d+\.?\d*)%/);
              let deltaPoints = 0;
              let unit: 'points' | 'percent' | undefined = undefined;

              if (pointsMatch && pointsMatch[0]) {
                deltaPoints = parseFloat(pointsMatch[0]);
                unit = 'points';
              } else if (percentMatch && percentMatch[0]) {
                deltaPoints = parseFloat(percentMatch[0]) / 100;
                unit = 'percent';
              }

              return {
                component: '💡',
                delta_points: deltaPoints,
                confidence: proj.confidence,
                unit,
              };
            });

            return {
              player_id: proj.player_id,
              player_name: proj.player_name,
              team: proj.team,
              position: proj.position,
              range: {
                p10: proj.projected_points.floor,
                p50: proj.projected_points.median,
                p90: proj.projected_points.ceiling,
              },
              confidence: proj.confidence,
              explanations,
              schema_version: data.schema_version,
              last_refresh: data.last_refresh,
            };
          });

          setRows(mappedRows);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load projections';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sport, scoringFormat, selectedWeek, client]);

  // Show "Coming Soon" for unavailable sports
  if (!client.isAvailable()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {client.getDisplayName()} Projections
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Coming Soon</p>
          <p className="text-gray-500 dark:text-gray-500">
            We're building {client.getDisplayName()} support. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            {client.getDisplayName()} Projections
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <WeekSelector currentWeek={selectedWeek} onWeekChange={setSelectedWeek} />
          </div>
        </div>

        <div className="flex flex-col gap-4 items-end">
          {/* Scoring Format Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Scoring:</label>
            <select
              value={scoringFormat}
              onChange={(e) => setScoringFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer transition-all hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {client.getScoringFormats().map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {/* Trust Snapshot and Accuracy Badge */}
          {projections && (
            <div className="trust-badge-container flex flex-col items-end gap-2">
              <TrustSnapshot
                ts={projections.last_refresh}
                ver={projections.schema_version}
                stale={false}
              />
              <AccuracyBadge sport={sport} />
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading projections...</p>
          <TableSkeleton rows={8} cols={4} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger re-fetch by updating a dependency
              setSelectedWeek(selectedWeek);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projections Table */}
      {!loading && !error && rows.length > 0 && (
        <div className="mb-8">
          <ProjectionsTable rows={rows} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rows.length === 0 && projections && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No projections available for this week.
          </p>
        </div>
      )}

      {/* Trust Metadata */}
      {projections && !loading && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date(projections.last_refresh).toLocaleString()} · Schema:{' '}
          {projections.schema_version}
        </div>
      )}
    </div>
  );
}
