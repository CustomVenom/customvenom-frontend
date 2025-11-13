// Zustand store for user preferences and app state
// Persists to localStorage (user preferences only, NOT session/auth data)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentWeek } from './utils';

interface UserStore {
  // Week management
  currentWeek: string; // Computed from Date (e.g., "2025-14")
  selectedWeek: string; // User can browse other weeks
  setSelectedWeek: (week: string) => void;

  // League and sport
  activeLeague: string | null;
  activeSport: 'nfl' | 'nba';
  setActiveLeague: (leagueKey: string | null) => void;
  setActiveSport: (sport: 'nfl' | 'nba') => void;

  // Scoring and preferences
  scoringFormat: string; // 'standard' | 'half_ppr' | 'full_ppr' for NFL, 'points' | '8cat' | '9cat' for NBA
  riskTolerance: 'protect' | 'neutral' | 'chase';
  setScoringFormat: (format: string) => void;
  setRiskTolerance: (risk: 'protect' | 'neutral' | 'chase') => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Week management - initialize with current week
      currentWeek: getCurrentWeek(),
      selectedWeek: getCurrentWeek(),
      setSelectedWeek: (week: string) => set({ selectedWeek: week }),

      // League and sport
      activeLeague: null,
      activeSport: 'nfl',
      setActiveLeague: (leagueKey: string | null) => set({ activeLeague: leagueKey }),
      setActiveSport: (sport: 'nfl' | 'nba') => set({ activeSport: sport }),

      // Scoring and preferences
      scoringFormat: 'half_ppr', // Default for NFL
      riskTolerance: 'neutral',
      setScoringFormat: (format: string) => set({ scoringFormat: format }),
      setRiskTolerance: (risk: 'protect' | 'neutral' | 'chase') => set({ riskTolerance: risk }),
    }),
    {
      name: 'cv-user-state',
      // Only persist user preferences, NOT session/auth data
      partialize: (state) => ({
        selectedWeek: state.selectedWeek,
        activeLeague: state.activeLeague,
        activeSport: state.activeSport,
        scoringFormat: state.scoringFormat,
        riskTolerance: state.riskTolerance,
        // currentWeek is computed, don't persist it
      }),
    },
  ),
);
