import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Vitest config — pure-logic unit tests for the data layer (lib/football, lib/copilot).
 * Node environment only; component/visual correctness is validated in the browser preview.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
