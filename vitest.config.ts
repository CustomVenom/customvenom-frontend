import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts?(x)'],
    exclude: ['**/node_modules/**', 'tests/**', 'playwright-report/**', 'e2e/'],
  },
});
