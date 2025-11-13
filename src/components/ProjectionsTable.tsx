'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react';

import ColumnToggle from '@/components/ColumnToggle';
import PlayerDrawer from '@/components/PlayerDrawer';
import { clampChips, type Row } from '@/lib/tools';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ConfidenceDecayBadge } from '@/components/ConfidenceDecayBadge';
import { ExplanationChips } from '@/components/ExplanationChips';
import { ProjectionRibbon } from '@/components/ProjectionRibbon';

type Props = { rows: Row[] };

const ALL_COLUMNS = [
  { key: 'team', label: 'Team', defaultOn: true, mobileHide: true, sortable: true },
  { key: 'pos', label: 'Pos', defaultOn: true, mobileHide: true, sortable: true },
  { key: 'floor', label: 'Floor', defaultOn: true, sortable: true },
  { key: 'median', label: 'Median', defaultOn: true, sortable: true },
  { key: 'ceiling', label: 'Ceiling', defaultOn: true, mobileHide: true, sortable: true },
  { key: 'confidence', label: 'Confidence', defaultOn: true, sortable: true },
  { key: 'reasons', label: 'Reasons', defaultOn: true, sortable: false },
];

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;
type Position = (typeof POSITIONS)[number];

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function ProjectionsTable({ rows }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'median', direction: 'desc' });

  // Pagination state from URL or defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '25', 10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [positionFilter, setPositionFilter] = useState<Position[]>(
    searchParams
      .get('positions')
      ?.split(',')
      .filter((p): p is Position => POSITIONS.includes(p as Position)) || [],
  );
  const [teamFilter, setTeamFilter] = useState(searchParams.get('team') || '');

  const columns = ALL_COLUMNS;

  const colsToRender = useMemo(
    () => columns.filter((c) => visible[c.key] !== false),
    [columns, visible],
  );

  // Filter logic
  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.player_name?.toLowerCase().includes(query) ||
          r.player_id.toLowerCase().includes(query) ||
          r.team?.toLowerCase().includes(query),
      );
    }

    // Position filter
    if (positionFilter.length > 0) {
      filtered = filtered.filter((r) => positionFilter.includes(r.position as Position));
    }

    // Team filter
    if (teamFilter.trim()) {
      const team = teamFilter.toLowerCase().trim();
      filtered = filtered.filter((r) => r.team?.toLowerCase() === team);
    }

    return filtered;
  }, [rows, searchQuery, positionFilter, teamFilter]);

  // Sorting logic
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (key) {
        case 'team':
          aVal = a.team || '';
          bVal = b.team || '';
          break;
        case 'pos':
          aVal = a.position || '';
          bVal = b.position || '';
          break;
        case 'floor':
          aVal = a.range.p10;
          bVal = b.range.p10;
          break;
        case 'median':
          aVal = a.range.p50;
          bVal = b.range.p50;
          break;
        case 'ceiling':
          aVal = a.range.p90;
          bVal = b.range.p90;
          break;
        case 'confidence':
          aVal = a.confidence ?? 0;
          bVal = b.confidence ?? 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      // Ensure both values are numbers for arithmetic
      const aNum = typeof aVal === 'number' ? aVal : 0;
      const bNum = typeof bVal === 'number' ? bVal : 0;
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    });

    return sorted;
  }, [filteredRows, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedRows.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  // Update URL when filters/pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (perPage !== 25) params.set('perPage', perPage.toString());
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (positionFilter.length > 0) params.set('positions', positionFilter.join(','));
    if (teamFilter.trim()) params.set('team', teamFilter.trim());

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [currentPage, perPage, searchQuery, positionFilter, teamFilter, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchQuery, positionFilter, teamFilter, currentPage, totalPages, router, searchParams]);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) + positionFilter.length + (teamFilter.trim() ? 1 : 0);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function togglePosition(pos: Position) {
    setPositionFilter((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );
  }

  function clearFilters() {
    setSearchQuery('');
    setPositionFilter([]);
    setTeamFilter('');
  }

  function handleSort(key: string) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }

  function openDrawer(row: Row) {
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRow(null);
  }

  // Keyboard shortcuts for pagination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with typing
      }

      if (e.key === 'ArrowLeft' && e.ctrlKey && currentPage > 1) {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', (currentPage - 1).toString());
        router.push(`?${params.toString()}`, { scroll: false });
      } else if (e.key === 'ArrowRight' && e.ctrlKey && currentPage < totalPages) {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', (currentPage + 1).toString());
        router.push(`?${params.toString()}`, { scroll: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, router, searchParams]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="h2">Weekly Projections</h2>
        <ColumnToggle columns={columns} onChange={setVisible} className="justify-self-end" />
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cv-primary))]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePosition(pos)}
                className={`px-2 py-1 text-xs rounded ${
                  positionFilter.includes(pos)
                    ? 'bg-[rgb(var(--cv-primary))] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedRows.length)} of {sortedRows.length}{' '}
          players
          {rows.length !== sortedRows.length && ` (filtered from ${rows.length} total)`}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 projections-table-container">
        <table
          role="table"
          aria-label="Player projections"
          className="w-full text-sm min-w-[640px]"
        >
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="sticky-first text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300"
              >
                Player
              </th>
              {colsToRender.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={
                    sortConfig.key === c.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={`text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300 ${
                    c.mobileHide ? 'hide-sm' : ''
                  } ${c.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500' : ''}`}
                  onClick={() => c.sortable && handleSort(c.key)}
                  onKeyDown={(e) => {
                    if (c.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(c.key);
                    }
                  }}
                  tabIndex={c.sortable ? 0 : -1}
                >
                  <div className="flex items-center gap-1">
                    {c.label}
                    {c.sortable && sortConfig.key === c.key && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((r, i) => {
              const chips = clampChips(r.explanations);
              return (
                <tr
                  key={i}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="sticky-first px-3 py-2">
                    <button
                      className="text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-1"
                      onClick={() => openDrawer(r)}
                      aria-label={`Open ${r.player_name} details`}
                    >
                      {r.player_name ?? r.player_id}
                    </button>
                  </td>

                  {visible['team'] !== false && (
                    <td
                      className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                        ALL_COLUMNS.find((x) => x.key === 'team')?.mobileHide ? 'hide-sm' : ''
                      }`}
                    >
                      {r.team ?? '—'}
                    </td>
                  )}

                  {visible['pos'] !== false && (
                    <td
                      className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                        ALL_COLUMNS.find((x) => x.key === 'pos')?.mobileHide ? 'hide-sm' : ''
                      }`}
                    >
                      {r.position ?? '—'}
                    </td>
                  )}

                  {visible['floor'] !== false && (
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {r.range.p10.toFixed(1)}
                    </td>
                  )}

                  {visible['median'] !== false && (
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent flex items-center">
                        {r.range.p50.toFixed(1)}
                        {visible['confidence'] !== false && r.confidence !== undefined && (
                          <ConfidenceIndicator confidence={r.confidence} />
                        )}
                      </div>
                      {visible['reasons'] !== false && chips.length > 0 && (
                        <ExplanationChips explanations={chips} />
                      )}
                      <ProjectionRibbon
                        floor={r.range.p10}
                        median={r.range.p50}
                        ceiling={r.range.p90}
                      />
                    </td>
                  )}

                  {visible['ceiling'] !== false && (
                    <td
                      className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                        ALL_COLUMNS.find((x) => x.key === 'ceiling')?.mobileHide ? 'hide-sm' : ''
                      }`}
                    >
                      {r.range.p90.toFixed(1)}
                    </td>
                  )}

                  {visible['confidence'] !== false && (
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium">
                          {((r.confidence ?? 0) * 100).toFixed(0)}%
                        </span>
                        {r.confidence_metadata && r.confidence_metadata.decay_applied > 0 && (
                          <ConfidenceDecayBadge
                            confidence={r.confidence ?? 0}
                            decayMetadata={r.confidence_metadata}
                          />
                        )}
                      </div>
                    </td>
                  )}

                  {visible['reasons'] !== false && (
                    <td className="px-3 py-2">
                      {chips.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Shown with projection
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tip: Use Columns to reduce clutter; player column stays pinned on scroll.
        {totalPages > 1 && ' Use Ctrl+Arrow keys to navigate pages.'}
      </p>

      <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
    </div>
  );
}
