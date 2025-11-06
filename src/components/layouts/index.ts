/**
 * Layout Components
 *
 * Reusable layout wrappers for consistent page structure:
 *
 * - BaseLayout: Site-wide wrapper (header, footer)
 * - LeagueLayout: League context wrapper (league nav, team selector)
 * - ToolLayout: Tool pages wrapper (tool tabs, breadcrumbs)
 *
 * Usage:
 * ```tsx
 * import { BaseLayout, LeagueLayout, ToolLayout } from '@/components/layouts';
 *
 * // Base layout only
 * <BaseLayout>
 *   <YourPage />
 * </BaseLayout>
 *
 * // Base + League context
 * <BaseLayout>
 *   <LeagueLayout>
 *     <YourLeaguePage />
 *   </LeagueLayout>
 * </BaseLayout>
 *
 * // Base + League + Tool
 * <BaseLayout>
 *   <LeagueLayout>
 *     <ToolLayout>
 *       <YourToolPage />
 *     </ToolLayout>
 *   </LeagueLayout>
 * </BaseLayout>
 * ```
 */

export { BaseLayout } from './BaseLayout';
export { LeagueLayout } from './LeagueLayout';
export { ToolLayout } from './ToolLayout';

