import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: [
      'src/**/*.{test,spec}.ts?(x)',
      'tests/unit/**/*.{test,spec}.ts?(x)',
      'tests/integration/**/*.{test,spec}.ts?(x)',
    ],
    exclude: [
      '**/node_modules/**',
      'playwright-report/**',
      'tests/e2e/**',
      'tests/**/*.spec.ts', // Exclude Playwright .spec.ts files
      'tests/**/*.spec.tsx',
    ],
    globals: true,
    environment: 'node',
    testTimeout: 10000, // Increase timeout for integration tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@customvenom/lib': path.resolve(__dirname, './packages/lib'),
      '@customvenom/config': path.resolve(__dirname, './packages/config'),
      '@customvenom/ui': path.resolve(__dirname, './packages/ui'),
    },
  },
});
