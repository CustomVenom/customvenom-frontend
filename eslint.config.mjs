// Flat config for React + TypeScript (ESLint v9)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore heavy/build folders and auto-generated files
  { ignores: ['node_modules/', '.next/', 'out/', 'dist/', 'coverage/', '.open-next/', '.open-next/.build/', 'next-env.d.ts'] },

  // Base JS recommended
  js.configs.recommended,

  // Register plugins
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks
    }
  },

  // TypeScript rules (non type-aware)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false,
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },

  // JS/TS common rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Add browser and node globals so they're known
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        crypto: 'readonly',
        Buffer: 'readonly',
        // Node globals
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // React globals
        React: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        // Other globals
        JSX: 'readonly',
        // Additional globals
        location: 'readonly',
        ReadableStream: 'readonly',
        PerformanceObserver: 'readonly',
        RequestInit: 'readonly'
      }
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
        }
      }
    },
    rules: {
      'no-unused-vars': 'off', // prefer TS rule above
      'import/no-unresolved': 'warn',
      'import/no-duplicates': 'warn',
      'import/order': 'off', // too noisy, prettier handles formatting
      // React 17+ JSX transform
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      ...reactHooks.configs.recommended.rules
    }
  },

  // Enforce env bracket notation in app source only
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env'][property.name=/^NEXT_PUBLIC_/]",
          message: "Use bracket access: process.env['NEXT_PUBLIC_…']"
        }
      ]
    }
  },

  // Configs and tests: do not enforce the env dot-access rule
  {
    files: [
      '**/*.config.{js,ts,mjs,cjs}',
      'vitest.config.{js,ts,mjs,cjs}',
      'jest.config.{js,ts,mjs,cjs}',
      '**/*.test.{ts,tsx,js,jsx}',
      'tests/**/*',
      'scripts/**/*'
    ],
    rules: {
      'no-restricted-syntax': 'off'
    }
  },

  // Scripts override with node globals
  {
    files: ['scripts/**/*.{js,ts,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly'
      }
    }
  },

  // Turn off stylistic conflicts
  prettier
];
