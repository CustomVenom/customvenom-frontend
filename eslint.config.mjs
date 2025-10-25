// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  // Ignore everything except source files
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '.next/',
      'out/',
      'build/',
      '.open-next/',
      'test-results/',
      'stories/',
      'docs/',
      '*.md',
      '*.json',
      '*.yml',
      '*.yaml',
      'public/',
      'scripts/',
      'tests/',
      'playwright.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'next.config.mjs',
      'vercel.json',
    ],
  },

  // Base rules only
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Prettier last
  prettier,

  // Minimal rules for performance
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off', // Allow console statements for debugging
      'prefer-const': 'warn',
      ...reactHooks.configs.recommended.rules,
    },
  },
];
