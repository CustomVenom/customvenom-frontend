import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/**/*', '**/*.spec.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
