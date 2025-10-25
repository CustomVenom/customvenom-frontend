/**
 * User preferences utilities
 * Stores and retrieves user preferences in localStorage
 */

export interface UserPrefs {
  density: 'compact' | 'normal' | 'comfortable';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  density: 'normal',
  theme: 'auto',
  notifications: true,
};

export function getPrefs(): UserPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;

  try {
    const stored = localStorage.getItem('user_prefs');
    if (stored) {
      return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }

  return DEFAULT_PREFS;
}

export function setPrefs(prefs: Partial<UserPrefs>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getPrefs();
    const updated = { ...current, ...prefs };
    localStorage.setItem('user_prefs', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}
