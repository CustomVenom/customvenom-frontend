'use client';

import React from 'react';

interface PageFrameProps {
  children: React.ReactNode;
  section?: 'projections' | 'tools' | 'league' | 'settings' | 'demo';
}

/**
 * PageFrame: Unified background styling per section
 * Implements "Venom Field Map" visual hierarchy
 */
export function PageFrame({ children, section = 'projections' }: PageFrameProps) {
  const bgStyles = {
    projections:
      'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30',
    tools:
      'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30',
    league:
      'bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-lime-950/30',
    settings:
      'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950/30 dark:via-slate-950/30 dark:to-zinc-950/30',
    demo: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/30 dark:via-amber-950/30 dark:to-orange-950/30',
  };

  return (
    <div className={`min-h-screen ${bgStyles[section]}`}>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
