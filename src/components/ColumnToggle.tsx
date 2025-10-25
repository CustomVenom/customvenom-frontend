'use client';

import { useEffect, useState } from 'react';

type Column = { key: string; label: string; defaultOn?: boolean; mobileHide?: boolean };

type Props = {
  storageKey?: string;
  columns: Column[];
  onChange: (visible: Record<string, boolean>) => void;
  className?: string;
};

const DEFAULT_KEY = 'cv:column-visibility';

export default function ColumnToggle({
  storageKey = DEFAULT_KEY,
  columns,
  onChange,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  // Load saved state or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setVisible(JSON.parse(saved));
      } else {
        const init: Record<string, boolean> = {};
        columns.forEach(c => { init[c.key] = c.defaultOn !== false; });
        setVisible(init);
      }
    } catch {
      const init: Record<string, boolean> = {};
      columns.forEach(c => { init[c.key] = c.defaultOn !== false; });
      setVisible(init);
    }
  }, [storageKey, columns]);

  // Persist and notify
  useEffect(() => {
    if (!Object.keys(visible).length) return;
    localStorage.setItem(storageKey, JSON.stringify(visible));
    onChange(visible);
  }, [visible, storageKey, onChange]);

  function toggle(k: string) {
    setVisible(v => ({ ...v, [k]: !v[k] }));
  }

  return (
    <div className={`relative ${className}`}>
      <button 
        className="cv-btn-ghost text-xs px-3 py-1.5" 
        onClick={() => setOpen(o => !o)} 
        aria-expanded={open}
        aria-label="Toggle column visibility"
      >
        Columns
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgb(var(--bg-card))] p-2 shadow-2xl z-20">
            <div className="text-xs text-[rgb(var(--text-muted))] px-2 pb-2 font-medium">
              Show or hide columns
            </div>
            <ul className="max-h-64 overflow-auto space-y-1">
              {columns.map(c => (
                <li key={c.key} className="flex items-center justify-between px-2 py-1.5 hover:bg-[rgba(16,185,129,0.1)] rounded">
                  <label className="text-sm text-[rgb(var(--text-secondary))] flex-1 cursor-pointer">
                    {c.label}
                  </label>
                  <input
                    type="checkbox"
                    checked={!!visible[c.key]}
                    onChange={() => toggle(c.key)}
                    aria-label={`Toggle ${c.label}`}
                    className="cursor-pointer"
                  />
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[rgba(148,163,184,0.1)]">
              <button className="cv-btn-ghost text-xs" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

