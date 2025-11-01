'use client';

import { useMemo, useState } from 'react';

import ColumnToggle from '@/components/ColumnToggle';
import PlayerDrawer from '@/components/PlayerDrawer';
import { clampChips, type Row } from '@/lib/tools';

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

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function ProjectionsTable({ rows }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'median', direction: 'desc' });

  const columns = ALL_COLUMNS;

  const colsToRender = useMemo(
    () => columns.filter((c) => visible[c.key] !== false),
    [columns, visible],
  );

  // Sorting logic
  const sortedRows = useMemo(() => {
    const sorted = [...rows];
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
      
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return sorted;
  }, [rows, sortConfig]);

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="h2">Weekly Projections</h2>
        <ColumnToggle columns={columns} onChange={setVisible} className="justify-self-end" />
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="sticky-first text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Player
              </th>
              {colsToRender.map((c) => (
                <th
                  key={c.key}
                  className={`text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300 ${
                    c.mobileHide ? 'hide-sm' : ''
                  } ${c.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                  onClick={() => c.sortable && handleSort(c.key)}
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
            {sortedRows.map((r, i) => {
              const chips = clampChips(r.explanations);
              return (
                <tr
                  key={i}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="sticky-first px-3 py-2">
                    <button
                      className="text-brand-primary dark:text-brand-accent font-medium underline hover:no-underline"
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
                    <td className="px-3 py-2 font-semibold text-brand-primary dark:text-brand-accent">
                      {r.range.p50.toFixed(1)}
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
                      <span className="text-xs font-medium">
                        {((r.confidence ?? 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                  )}

                  {visible['reasons'] !== false && (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {chips.length === 0 && <span className="text-xs text-gray-400">—</span>}
                        {chips.map((chip, idx) => (
                          <span key={idx} className="cv-chip">
                            {chip.component} {chip.delta_points >= 0 ? '+' : ''}
                            {(chip.delta_points * 100).toFixed(1)}%
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tip: Use Columns to reduce clutter; player column stays pinned on scroll.
      </p>

      <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
    </div>
  );
}
