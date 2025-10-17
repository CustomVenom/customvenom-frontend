'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { type Row } from '@/lib/tools';

type Props = {
  rows: Row[];
  placeholder?: string;
  onSelect: (row: Row) => void;
  className?: string;
  autoFocus?: boolean;
};

export default function PlayerSearch({
  rows,
  placeholder = 'Search player…',
  onSelect,
  className = '',
  autoFocus = false,
}: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return rows
      .filter(r => (r.player_name || '').toLowerCase().includes(s))
      .slice(0, 20);
  }, [q, rows]);

  function choose(i: number) {
    const row = results[i];
    if (!row) return;
    onSelect(row);
    setQ('');
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) setOpen(true);
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); setActive(0); }}
        onKeyDown={onKeyDown}
        onFocus={() => q && setOpen(true)}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-brand-primary dark:focus:border-brand-accent focus:outline-none"
        autoFocus={autoFocus}
        aria-expanded={open}
        aria-controls="player-search-listbox"
        role="combobox"
      />

      {open && results.length > 0 && (
        <ul
          id="player-search-listbox"
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 text-sm shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={`${r.player_id ?? r.player_name}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer rounded px-3 py-2 transition-colors ${
                i === active 
                  ? 'bg-brand-primary text-white' 
                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => { e.preventDefault(); choose(i); }}
            >
              <div className="font-medium">{r.player_name ?? '—'}</div>
              {(r.team || r.position) && (
                <div className={`text-xs ${i === active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {r.team && <span>{r.team}</span>}
                  {r.team && r.position && <span> · </span>}
                  {r.position && <span>{r.position}</span>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

