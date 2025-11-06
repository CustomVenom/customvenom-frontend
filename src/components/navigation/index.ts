/**
 * Navigation Components
 *
 * Reusable navigation components for consistent site navigation:
 *
 * - TopNav: Site-wide top navigation (brand, main links, tools dropdown, settings)
 * - LeagueNav: League-specific navigation (overview, roster, projections, etc.)
 * - ToolsTabs: Tool pages navigation (decisions, start/sit, FAAB, players)
 *
 * Usage:
 * ```tsx
 * import { TopNav, LeagueNav } from '@/components/navigation';
 * import ToolsTabs from '@/components/ToolsTabs';
 *
 * // Site-wide navigation
 * <TopNav />
 *
 * // League context navigation
 * <LeagueNav leagueKey="449.l.12345" />
 *
 * // Tool pages navigation
 * <ToolsTabs />
 * ```
 */

export { TopNav, type TopNavProps, type NavLink } from './TopNav';
export { LeagueNav, type LeagueNavProps, type LeagueNavLink } from './LeagueNav';

