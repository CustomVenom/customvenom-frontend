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
  { ignores: ['node_modules/', '.next/', 'out/', 'dist/', 'coverage/'] },

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
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
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
      ...reactHooks.configs.recommended.rules
    }
  },

  // Turn off stylistic conflicts
  prettier
];
