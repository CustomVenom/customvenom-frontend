'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * DashboardHeader - Header component for dashboard pages
 *
 * Provides consistent header styling for dashboard sections:
 * - Title and subtitle
 * - Optional action buttons/widgets
 * - Responsive layout
 */
export function DashboardHeader({
  title = 'Dashboard',
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 truncate">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 truncate">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
