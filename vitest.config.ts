import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Unit-test config, deliberately separate from `vite.config.ts`.
 *
 * The TanStack Start plugin owns SSR entry generation and route-tree codegen;
 * loading it under Vitest buys nothing and would make a schema test depend on
 * the server build graph.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the package.json `imports` field so tests resolve `#/…` the
      // same way the application build does.
      '#/': `${fileURLToPath(new URL('./src', import.meta.url))}/`,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    restoreMocks: true,
  },
})
