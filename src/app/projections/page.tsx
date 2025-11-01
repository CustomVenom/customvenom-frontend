'use client';
import { useEffect, useState, useMemo } from 'react';

import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';
import DemoBadge from '@/components/DemoBadge';
import GoProButton from '@/components/GoProButton';
import ImportantDecisionsStrip, { selectImportantDecisions } from '@/components/ImportantDecisionsStrip';
import PositionFilter, { type Position } from '@/components/PositionFilter';
import ProjectionsTable from '@/components/ProjectionsTable';
import UncertaintyBand from '@/components/UncertaintyBand';
import WeekSelector from '@/components/WeekSelector';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { type Entitlements } from '@/lib/entitlements';
import {
  fetchProjections,
  mapApiProjectionToRow,
  type Row,
  type ApiProjectionsResponse,
} from '@/lib/tools';

function ProjectionsPageInner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('2025-06');
  const [selectedPosition, setSelectedPosition] = useState<Position>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchProjections({ week: selectedWeek });

        if (!result.ok || !result.body) {
          throw new Error(`Failed to fetch projections: ${result.status}`);
        }

        const data: ApiProjectionsResponse = result.body;

        // Map API projections to Row format
        const mappedRows = data.projections.map((proj) =>
          mapApiProjectionToRow(proj, data.schema_version, data.last_refresh),
        );

        setRows(mappedRows);
        setSchemaVersion(data.schema_version);
        setLastRefresh(data.last_refresh);

        // Check for stale headers (would come from response headers, but we don't have access here)
        // For now, we'll check if last_refresh is older than 24 hours
        const refreshTime = new Date(data.last_refresh).getTime();
        const now = Date.now();
        const ageHours = (now - refreshTime) / (1000 * 60 * 60);
        setIsStale(ageHours > 24);
        setIsDemoMode(false); // Could be set from header if available
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
      } finally {
        setLoading(false);
      }
    };

    const loadEntitlements = async () => {
      try {
        const response = await fetch('/api/entitlements');
        if (response.ok) {
          const userEntitlements = await response.json();
          setEntitlements(userEntitlements);
        }
      } catch (error) {
        console.error('Failed to load entitlements:', error);
      }
    };

    fetchData();
    loadEntitlements();
  }, [selectedWeek]);

  // Filter rows by position
  const filteredRows = useMemo(() => {
    if (selectedPosition === 'ALL') return rows;
    return rows.filter((r) => r.position === selectedPosition);
  }, [rows, selectedPosition]);

  // Derive important decisions
  const importantDecisions = useMemo(() => {
    return selectImportantDecisions(rows, 0.65);
  }, [rows]);

  const isPro = entitlements?.isPro || false;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="flex justify-between items-start mb-8 gap-5">
          <h1 className="text-4xl font-bold text-gray-800 m-0 mb-3">Projections</h1>
        </div>
        <div className="p-5">
          <p className="text-center text-lg text-gray-600 mb-5">Loading projections...</p>
          <TableSkeleton rows={8} cols={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="text-center text-xl text-red-600 py-10 bg-red-50 border border-red-200 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-5">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 m-0 mb-3">
            <GlossaryTip term="Baseline">Projections</GlossaryTip>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <WeekSelector currentWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            <PositionFilter
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <DemoBadge show={isDemoMode} />
          <TrustSnapshot ts={lastRefresh || ''} ver={schemaVersion} stale={isStale} />
          {!isPro && (
            <div className="bg-linear-to-br from-[#ff6b35] to-[#f7931e] p-3 px-4 rounded-lg shadow-lg">
              <GoProButton
                priceId={process.env['NEXT_PUBLIC_STRIPE_PRICE_ID'] || 'price_pro_season'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Important Decisions Strip */}
      {importantDecisions.length > 0 && (
        <ImportantDecisionsStrip
          decisions={importantDecisions}
          onDecisionClick={(decision) => {
            // Scroll to player in table or open drawer
            console.log('Decision clicked:', decision);
          }}
        />
      )}

      {/* Projections Table */}
      <div className="mb-8">
        <ProjectionsTable rows={filteredRows} />
      </div>

      {/* Sample Uncertainty Band (could be added to table rows on hover or expand) */}
      {filteredRows.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Sample Uncertainty Visualization
          </h3>
          <div className="space-y-4">
            {filteredRows.slice(0, 3).map((row) => (
              <div key={row.player_id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {row.player_name} ({row.position})
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {((row.confidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <UncertaintyBand
                  floor={row.range.p10}
                  median={row.range.p50}
                  ceiling={row.range.p90}
                  confidence={row.confidence}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectionsPage() {
  return (
    <ApiErrorBoundary>
      <ProjectionsPageInner />
    </ApiErrorBoundary>
  );
}
