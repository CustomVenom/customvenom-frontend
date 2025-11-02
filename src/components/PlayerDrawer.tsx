'use client';

import { useEffect, useRef } from 'react';

import { clampChips, type Row } from '@/lib/tools';

type Props = {
  open: boolean;
  onClose: () => void;
  row: Row | null;
};

export default function PlayerDrawer({ open, onClose, row }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Click outside to close
  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onTrap(e: KeyboardEvent) {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener('keydown', onTrap);
    (first || panel).focus();
    return () => window.removeEventListener('keydown', onTrap);
  }, [open]);

  if (!open || !row) return null;

  const chips = clampChips(row.explanations);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-drawer-title"
      aria-describedby="player-drawer-description"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[rgb(var(--bg))] shadow-2xl outline-none focus:outline-none overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-[rgba(148,163,184,0.1)]"
      >
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.1)] p-4">
          <h2
            id="player-drawer-title"
            className="text-lg font-bold text-[rgb(var(--text-primary))]"
          >
            {row.player_name ?? 'Player'} Details
          </h2>
          <button
            onClick={onClose}
            className="cv-btn-ghost text-sm"
            aria-label="Close player details"
          >
            Close
          </button>
        </div>

        <div id="player-drawer-description" className="sr-only">
          View detailed projections, range analysis, and reasoning for{' '}
          {row.player_name ?? 'this player'}.
        </div>

        <div className="p-4 space-y-4">
          {/* Player meta */}
          {(row.team || row.position) && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {row.team && <span>{row.team}</span>}
              {row.position && <span>· {row.position}</span>}
            </div>
          )}

          {/* Range ribbons */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Floor</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {row.range.p10.toFixed(1)}
              </div>
            </div>
            <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-3 bg-brand-primary/5 dark:bg-brand-accent/10">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Median</div>
              <div className="text-xl font-semibold text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent">
                {row.range.p50.toFixed(1)}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ceiling</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {row.range.p90.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Reasons (max 2 chips) */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reasons (max 2)</div>
            <div className="flex flex-wrap gap-2">
              {chips.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  None speaking
                </span>
              )}
              {chips.map((c, i) => (
                <span key={i} className="cv-chip">
                  {c.component} {c.delta_points >= 0 ? '+' : ''}
                  {(c.delta_points * 100).toFixed(1)}%
                </span>
              ))}
            </div>
          </div>

          {/* Trust snapshot */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Trust</div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-mono">schema {row.schema_version}</span>
              <span>·</span>
              <span>refreshed {new Date(row.last_refresh).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button className="cv-btn-primary flex-1">Add to watchlist</button>
            <button className="cv-btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
