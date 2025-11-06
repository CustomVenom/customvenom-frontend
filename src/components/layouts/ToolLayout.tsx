'use client';

import { ReactNode } from 'react';
import ToolsTabs from '@/components/ToolsTabs';
import Breadcrumbs from '@/components/Breadcrumbs';

interface ToolLayoutProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
}

/**
 * ToolLayout - Tool pages wrapper with tool tabs and breadcrumbs
 *
 * Provides consistent layout for tool pages:
 * - Tool navigation tabs (Decisions, Start/Sit, FAAB, Players)
 * - Breadcrumb navigation
 * - Tool-specific content area
 *
 * Used for pages under /dashboard/tools/*:
 * - /dashboard/decisions
 * - /dashboard/start-sit
 * - /dashboard/faab
 * - /dashboard/players
 */
export function ToolLayout({ children, showBreadcrumbs = true, className }: ToolLayoutProps) {
  return (
    <div className={className || ''}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="mb-4">
          <Breadcrumbs />
        </div>
      )}

      {/* Tool Tabs */}
      <ToolsTabs />

      {/* Tool Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
