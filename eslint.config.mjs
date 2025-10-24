import eslint from '@eslint/js';
import next from 'eslint-config-next';

export default [
  eslint.configs.recommended,
  next,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
