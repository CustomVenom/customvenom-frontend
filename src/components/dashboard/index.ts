/**
 * Dashboard Components
 *
 * Components for the dashboard redesign matching ESPN/Yahoo/Sleeper patterns:
 *
 * - DashboardHeader: Header component with title, subtitle, and actions
 * - QuickStats: Quick stats display with trend indicators
 * - DashboardToolCard: Individual tool card component
 * - DashboardToolGrid: Grid of tool cards (replaces button grid)
 * - DashboardMetrics: Team metrics (existing)
 * - NavigationCards: Tool navigation (existing)
 *
 * Usage:
 * ```tsx
 * import {
 *   DashboardHeader,
 *   QuickStats,
 *   DashboardToolGrid,
 * } from '@/components/dashboard';
 *
 * // Dashboard header
 * <DashboardHeader
 *   title="Dashboard"
 *   subtitle="Your fantasy command center"
 *   actions={<TeamSelector />}
 * />
 *
 * // Quick stats
 * <QuickStats stats={teamStats} />
 *
 * // Tool grid
 * <DashboardToolGrid columns={3} />
 * ```
 */

export { DashboardHeader } from './DashboardHeader';
export { QuickStats, type QuickStat, StatIcons } from './QuickStats';
export { DashboardToolCard, type DashboardToolCardProps } from './DashboardToolCard';
export { DashboardToolGrid } from './DashboardToolGrid';
export { DashboardMetrics } from './DashboardMetrics';
export { NavigationCards } from './NavigationCards';

