'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeagueNavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface LeagueNavProps {
  leagueKey?: string;
  links?: LeagueNavLink[];
  className?: string;
}

const defaultLeagueLinks: LeagueNavLink[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: '/dashboard/roster',
    label: 'Roster',
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: '/dashboard/projections',
    label: 'Projections',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    href: '/dashboard/tracking',
    label: 'Tracking',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: '/dashboard/leagues',
    label: 'Leagues',
    icon: <Trophy className="h-4 w-4" />,
  },
];

/**
 * LeagueNav - League-specific navigation component
 *
 * Provides navigation within league context:
 * - Overview/Dashboard
 * - Roster
 * - Projections
 * - Tracking
 * - League management
 *
 * Used in LeagueLayout to provide consistent navigation
 * for all league-related pages.
 */
export function LeagueNav({
  leagueKey,
  links = defaultLeagueLinks,
  className,
}: LeagueNavProps) {
  const pathname = usePathname();

  // If leagueKey is provided, prepend it to hrefs
  const getHref = (href: string) => {
    if (leagueKey && href.startsWith('/dashboard')) {
      return `${href}?league=${leagueKey}`;
    }
    return href;
  };

  return (
    <nav
      aria-label="League navigation"
      className={cn(
        'border-b border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-elevated))]',
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={getHref(link.href)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  'border-b-2 border-transparent',
                  isActive
                    ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] border-[rgb(var(--cv-primary-strong))] dark:border-[rgb(var(--cv-primary))]'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))] hover:border-[rgb(var(--cv-primary-strong))]/50 dark:hover:border-[rgb(var(--cv-primary))]/50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default LeagueNav;

