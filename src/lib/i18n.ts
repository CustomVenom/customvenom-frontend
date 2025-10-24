/**
 * i18n utilities
 * Simple translation scaffold
 */

export const i18n = {
  en: {
    'app.name': 'Custom Venom',
    'app.tagline': 'Fantasy Football Decision Support',
    'trust.schema': 'Schema',
    'trust.calibrated': 'Calibrated',
    'trust.stale': 'Stale',
    'nav.projections': 'Projections',
    'nav.tools': 'Tools',
    'nav.league': 'League',
    'nav.settings': 'Settings',
    'prolock.unlock': 'Unlock Pro features',
    'prolock.upgrade': 'Upgrade to Pro',
    'prolock.description': 'Upgrade to Pro to access advanced features and insights',
  },
};

export type Locale = keyof typeof i18n;
export type Key = keyof typeof i18n.en;

export function t(key: Key, locale: Locale = 'en'): string {
  return i18n[locale]?.[key] || key;
}
