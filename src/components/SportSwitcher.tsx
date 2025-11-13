'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Sport } from '@/lib/sports/base/SportClient';
import { SportRegistry } from '@/lib/sports/registry';
import { useUserStore } from '@/lib/store';

/**
 * Global sport switcher for navigation
 * Shows in top nav, allows switching between NFL and NBA
 * Integrates with Zustand store for global state
 */
export function SportSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSport, setActiveSport } = useUserStore();

  // Detect current sport from URL or use Zustand store
  // Check for /tools/projections/nfl, /tools/projections/nba, /league/nfl, /league/nba patterns
  const sportMatch = pathname.match(/\/(tools|league)\/(nfl|nba)/);
  const urlSport: Sport = sportMatch ? (sportMatch[2] as Sport) : activeSport;
  const currentSport: Sport = urlSport || 'nfl';

  const handleSportChange = (sport: Sport) => {
    // Update Zustand store
    setActiveSport(sport);

    // Replace sport in current path
    let newPath = pathname;

    // If path contains /nfl or /nba, replace it
    if (pathname.includes('/nfl') || pathname.includes('/nba')) {
      newPath = pathname.replace(/\/(nfl|nba)/, `/${sport}`);
    } else {
      // If no sport in path, add it after /tools or /league
      if (pathname.startsWith('/tools')) {
        newPath = pathname.replace('/tools', `/tools/${sport}`);
      } else if (pathname.startsWith('/league')) {
        newPath = pathname.replace('/league', `/league/${sport}`);
      } else {
        // Default to projections route
        newPath = `/tools/projections/${sport}`;
      }
    }

    router.push(newPath);
  };

  const availableClients = SportRegistry.available();

  // Don't show if only one sport available
  if (availableClients.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[rgb(var(--text-secondary))] uppercase tracking-wide hidden sm:inline">
        Sport:
      </span>
      <div className="flex gap-1 bg-[rgb(var(--bg-secondary))] dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
        {SportRegistry.all().map((client) => {
          const sportId = client.getSportId();
          const isActive = sportId === currentSport;
          const isAvailable = client.isAvailable();

          return (
            <button
              key={sportId}
              onClick={() => handleSportChange(sportId)}
              disabled={!isAvailable}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[rgb(var(--cv-primary-strong))] dark:bg-[rgb(var(--cv-primary))] text-white'
                    : isAvailable
                      ? 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))] hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              aria-label={`Switch to ${client.getDisplayName()}`}
              aria-pressed={isActive}
            >
              {client.getDisplayName()}
              {!isAvailable && <span className="ml-1 text-xs">(Soon)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
