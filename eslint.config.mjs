// Flat config for React + TypeScript (ESLint v9)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore heavy/build folders
  { ignores: ['node_modules/', '.next/', 'out/', 'dist/', 'coverage/', '.open-next/', '.open-next/.build/'] },

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
      'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] } }
    },
    rules: {
      'no-unused-vars': 'off', // prefer TS rule above
      'import/no-unresolved': 'warn',
      'import/no-duplicates': 'warn',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      // React 17+ JSX transform
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      ...reactHooks.configs.recommended.rules,
      // Prevent process.env.FOO dot-access regression
      'no-restricted-syntax': [
        'warn',
        {
          selector: "MemberExpression[object.name='process'][property.name='env'][property.type='Identifier']",
          message: "Use process.env['NAME'] instead of process.env.NAME"
        }
      ]
    }
  },

  // Turn off stylistic conflicts
  prettier
];
