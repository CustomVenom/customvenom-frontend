// Players page - Full projections table with filters
'use client';

import { useMemo, useState } from 'react';
import { useUserStore } from '@/lib/store';
import { useProjections } from '@/hooks/use-projections';
import ProjectionsTable from '@/components/ProjectionsTable';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
// Select component not available, using native select
import { mapApiProjectionToRow } from '@/lib/tools';

type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

function PlayersContent() {
  const { scoringFormat, setScoringFormat, selectedWeek } = useUserStore();
  const { data: projectionsData, isLoading, error } = useProjections(selectedWeek);
  const [positionFilter, setPositionFilter] = useState<Position>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Convert projections to Row format for ProjectionsTable
  const rows = useMemo(() => {
    if (!projectionsData?.data) return [];

    return projectionsData.data.projections.map((proj) => {
      const normalizedProjection = {
        ...proj,
        schema_version: 'v2.1' as const,
      };
      return mapApiProjectionToRow(
        normalizedProjection as Parameters<typeof mapApiProjectionToRow>[0],
        'v2.1',
        projectionsData.data.last_refresh,
      );
    });
  }, [projectionsData]);

  // Filter rows by position
  const filteredRows = useMemo(() => {
    let filtered = rows;

    if (positionFilter !== 'ALL') {
      filtered = filtered.filter((row) => row.position === positionFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (row) =>
          row.player_name?.toLowerCase().includes(query) ||
          row.player_id.toLowerCase().includes(query) ||
          row.team?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [rows, positionFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <AlertDescription>Failed to load projections. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Players</h1>

        <select
          value={scoringFormat}
          onChange={(e) => setScoringFormat(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="standard">Standard</option>
          <option value="half_ppr">Half PPR</option>
          <option value="full_ppr">Full PPR</option>
        </select>
      </div>

      {/* Position Filter */}
      <div className="flex gap-2">
        {(['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as Position[]).map((pos) => (
          <button
            key={pos}
            onClick={() => setPositionFilter(pos)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              positionFilter === pos
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Projections Table */}
      {filteredRows.length > 0 ? (
        <ProjectionsTable rows={filteredRows} />
      ) : (
        <Alert>
          <AlertDescription>No players found matching your filters.</AlertDescription>
        </Alert>
      )}

      {projectionsData && <TrustSnapshot trust={projectionsData.trust} />}
    </div>
  );
}

export default function PlayersPage() {
  return (
    <ToolErrorBoundary toolName="Players">
      <PlayersContent />
    </ToolErrorBoundary>
  );
}
