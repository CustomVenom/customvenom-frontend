'use client';

import { ReactNode } from 'react';
import { LeagueSwitcher } from '@/components/LeagueSwitcher';
import TeamSelector from '@/components/TeamSelector';

interface LeagueLayoutProps {
  children: ReactNode;
  showTeamSelector?: boolean;
  className?: string;
}

/**
 * LeagueLayout - League context wrapper with league navigation and team selector
 *
 * Provides league-specific context for pages that need:
 * - League switcher (select active league)
 * - Team selector (select active team within league)
 * - League-aware navigation
 *
 * Used for pages that operate within a league context:
 * - Dashboard pages
 * - Roster views
 * - League-specific projections
 */
export function LeagueLayout({ children, showTeamSelector = true, className }: LeagueLayoutProps) {
  return (
    <div className={className || ''}>
      {/* League Context Bar */}
      <div className="border-b border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-elevated))] py-3 mb-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap items-center justify-between gap-4">
          {/* League Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[rgb(var(--text-muted))]">League:</span>
              <LeagueSwitcher />
            </div>
          </div>

          {/* Team Selector (if enabled) */}
          {showTeamSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[rgb(var(--text-muted))]">Team:</span>
              <TeamSelector />
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
