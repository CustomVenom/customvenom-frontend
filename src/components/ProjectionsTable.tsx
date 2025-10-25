'use client';

import { useMemo, useState } from 'react';

import ColumnToggle from '@/components/ColumnToggle';
import PlayerDrawer from '@/components/PlayerDrawer';
import { type Row } from '@/lib/tools';
import { clampChips } from '@/lib/tools';

type Props = { rows: Row[] };

const ALL_COLUMNS = [
  { key: 'team', label: 'Team', defaultOn: true, mobileHide: true },
  { key: 'pos', label: 'Pos', defaultOn: true, mobileHide: true },
  { key: 'floor', label: 'Floor', defaultOn: true },
  { key: 'median', label: 'Median', defaultOn: true },
  { key: 'ceiling', label: 'Ceiling', defaultOn: true, mobileHide: true },
  { key: 'reasons', label: 'Reasons', defaultOn: true },
];

export default function ProjectionsTable({ rows }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);

  const columns = ALL_COLUMNS;

  const colsToRender = useMemo(
    () => columns.filter(c => visible[c.key] !== false),
    [columns, visible]
  );

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
        <ColumnToggle
          columns={columns}
          onChange={setVisible}
          className="justify-self-end"
        />
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="sticky-first text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Player
              </th>
              {colsToRender.map(c => (
                <th
                  key={c.key}
                  className={`text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300 ${
                    c.mobileHide ? 'hide-sm' : ''
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
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
                    <td className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                      ALL_COLUMNS.find(x => x.key === 'team')?.mobileHide ? 'hide-sm' : ''
                    }`}>
                      {r.team ?? '—'}
                    </td>
                  )}

                  {visible['pos'] !== false && (
                    <td className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                      ALL_COLUMNS.find(x => x.key === 'pos')?.mobileHide ? 'hide-sm' : ''
                    }`}>
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
                    <td className={`px-3 py-2 text-gray-700 dark:text-gray-300 ${
                      ALL_COLUMNS.find(x => x.key === 'ceiling')?.mobileHide ? 'hide-sm' : ''
                    }`}>
                      {r.range.p90.toFixed(1)}
                    </td>
                  )}

                  {visible['reasons'] !== false && (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {chips.length === 0 && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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

