import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { spacing, typography as typo } from './src/lib/design-tokens';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    './tests/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens - must be defined directly for Tailwind @apply to work
        background: {
          primary: '#1a1a1a',
          secondary: '#242424',
          tertiary: '#2a2a2a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
          tertiary: '#808080',
        },
        border: {
          default: '#333333',
          hover: '#404040',
        },
        positive: '#10b981',
        negative: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        venom: {
          primary: '#22c55e',
          hover: '#16a34a',
          pressed: '#15803d',
        },
      },
      fontFamily: {
        sans: [typo.fonts.body, 'sans-serif'],
        mono: [typo.fonts.mono, 'monospace'],
      },
      fontSize: {
        'page-title': typo.sizes.pageTitle,
        'section-header': typo.sizes.sectionHeader,
        body: typo.sizes.body,
        small: typo.sizes.small,
        stats: typo.sizes.stats,
      },
      spacing: {
        base: `${spacing.base}px`,
        section: `${spacing.section}px`,
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
