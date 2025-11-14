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

      // Architecture Law #3: API is Contract, UI is Presentation
      // Prevent frontend from calculating fantasy points or using heuristics
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "BinaryExpression[left.type='MemberExpression'][right.type='Literal'][operator='*']",
          message:
            'Architecture Law #3: Frontend should not calculate fantasy points. Use API-provided data only. If API data is missing, show "Data unavailable" instead of using heuristics.',
        },
        {
          selector: "CallExpression[callee.name='calculateFantasyPoints']",
          message:
            'Architecture Law #3: Frontend must never calculate fantasy points. All calculations happen in the Python data pipeline.',
        },
        {
          selector: "CallExpression[callee.property.name='calculate']",
          message:
            'Architecture Law #3: Frontend must never calculate fantasy points. Use API-provided projections only.',
        },
      ],
    },
  },

  // Override for next-env.d.ts to disable triple-slash-reference warning
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
