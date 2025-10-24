'use client';

import * as React from 'react';
import { ProLock } from '@/components/ProLock';
import { canActivateAnotherLeague } from '@/lib/leagueGate';

interface League {
  id: string;
  name: string;
}

interface LeagueHeaderControlsProps {
  leagues: League[];
  activeId?: string;
  isPro?: boolean;
  onChange: (id: string) => void;
}

export function LeagueHeaderControls({
  leagues,
  activeId,
  isPro = false,
  onChange,
}: LeagueHeaderControlsProps) {
  const [open, setOpen] = React.useState(false);
  const activeCount = activeId ? 1 : 0;
  const [wantId, setWantId] = React.useState<string>();

  function requestChange(id: string) {
    const allowed = canActivateAnotherLeague(isPro, activeCount);
    if (!allowed && id !== activeId) {
      setWantId(id);
      return;
    }
    onChange(id);
    setOpen(false);
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setOpen(true)}
        className="text-xs rounded border border-gray-300 dark:border-gray-600 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Change league
      </button>
      
      {open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-[280px] rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Select a league</div>
          <ul className="max-h-60 overflow-auto">
            {leagues.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => requestChange(l.id)}
                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    l.id === activeId ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {l.name} {l.id === activeId ? '• Active' : ''}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                setOpen(false);
                setWantId(undefined);
              }}
              className="text-xs rounded border border-gray-300 dark:border-gray-600 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
          {!isPro && wantId && wantId !== activeId && (
            <div className="mt-3">
              <ProLock
                unlocked={false}
                cta={
                  <a href="#upgrade" className="rounded border border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-blue-600 dark:text-blue-400">
                    Go Pro
                  </a>
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

