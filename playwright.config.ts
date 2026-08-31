import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end config.
 *
 * The web server serves the **built** application rather than `vite dev`, and
 * that costs a few seconds per run on purpose. Dev-mode module resolution is far
 * more forgiving than a production bundle: a missing dependency, a bad import
 * specifier or an SSR-only module pulled into the client can all resolve happily
 * in dev and fail in the build. A suite that runs against the dev server is
 * green on exactly the failures that take a deployment down.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3210)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: { baseURL: BASE_URL, trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    /**
     * The single-column breakpoint. Neither the desktop nor the phone project
     * exercises it, so layout faults between 768 and 1440 would otherwise go
     * unseen — which is the width most tablets and half of all split-screen
     * laptop windows actually are.
     */
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm build && pnpm vite preview --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
