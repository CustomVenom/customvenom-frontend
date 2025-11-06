'use client';

import { usePathname } from 'next/navigation';
import {
  Brain,
  Users,
  DollarSign,
  Search,
  BarChart3,
  Target,
} from 'lucide-react';
import { DashboardToolCard, DashboardToolCardProps } from './DashboardToolCard';

const defaultTools: Omit<DashboardToolCardProps, 'isActive'>[] = [
  {
    title: 'Important Decisions',
    description: 'Get AI-powered recommendations for your lineup decisions and waiver wire moves.',
    href: '/dashboard/decisions',
    icon: <Brain className="h-6 w-6 text-venom-400" />,
  },
  {
    title: 'Start/Sit Assistant',
    description: 'Compare your players with confidence scores to optimize your weekly lineup.',
    href: '/dashboard/start-sit',
    icon: <Users className="h-6 w-6 text-venom-400" />,
  },
  {
    title: 'FAAB Helper',
    description: 'Optimize your free agent budget with data-driven bidding recommendations.',
    href: '/dashboard/faab',
    icon: <DollarSign className="h-6 w-6 text-venom-400" />,
  },
  {
    title: 'Player Search',
    description: 'Browse all available players with detailed projections and analysis.',
    href: '/dashboard/players',
    icon: <Search className="h-6 w-6 text-venom-400" />,
  },
  {
    title: 'Projections',
    description: 'View floor, median, and ceiling projections for all players in your league.',
    href: '/projections',
    icon: <BarChart3 className="h-6 w-6 text-venom-400" />,
  },
  {
    title: 'Roster',
    description: 'View your current roster with detailed player stats and projections.',
    href: '/dashboard/roster',
    icon: <Target className="h-6 w-6 text-venom-400" />,
  },
];

interface DashboardToolGridProps {
  tools?: Omit<DashboardToolCardProps, 'isActive'>[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * DashboardToolGrid - Grid of tool cards matching ESPN/Yahoo/Sleeper patterns
 *
 * Displays available tools as interactive cards:
 * - Responsive grid (2-4 columns)
 * - Hover effects
 * - Active state highlighting
 * - Icon support
 * - Badge support for new features
 */
export function DashboardToolGrid({
  tools = defaultTools,
  columns = 3,
  className,
}: DashboardToolGridProps) {
  const pathname = usePathname();

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className || ''}`}>
      {tools.map((tool) => (
        <DashboardToolCard
          key={tool.href}
          {...tool}
          isActive={pathname?.startsWith(tool.href)}
        />
      ))}
    </div>
  );
}

