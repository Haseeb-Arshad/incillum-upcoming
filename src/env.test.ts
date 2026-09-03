import { afterEach, expect, it, vi } from 'vitest'

/**
 * Public configuration parsing.
 *
 * `src/env.ts` validates once at module evaluation and throws on a bad value —
 * a misconfigured deployment should fail loudly at boot, not serve broken
 * canonicals. The case worth pinning is the one that is *not* a misconfiguration
 * but looks like one: `VITE_POSTHOG_HOST=` with no value, which is how a host
 * dashboard and a copied `.env.example` both present an unset optional. It must
 * fall back to the default, not take the whole page down.
 */

afterEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
})

async function loadEnv(overrides: Record<string, string>) {
  vi.stubEnv('VITE_SITE_URL', 'https://incillum.com')
  vi.stubEnv('VITE_CONTACT_EMAIL', 'hello@incillum.com')
  for (const [key, value] of Object.entries(overrides)) vi.stubEnv(key, value)
  return import('#/env.ts')
}

it('falls back to the US host when VITE_POSTHOG_HOST is present but empty', async () => {
  const env = await loadEnv({ VITE_POSTHOG_HOST: '' })
  expect(env.posthogHost).toBe('https://us.i.posthog.com')
})

it('falls back to the US host when VITE_POSTHOG_HOST is absent', async () => {
  const env = await loadEnv({})
  expect(env.posthogHost).toBe('https://us.i.posthog.com')
})

it('keeps a valid VITE_POSTHOG_HOST', async () => {
  const env = await loadEnv({ VITE_POSTHOG_HOST: 'https://eu.i.posthog.com' })
  expect(env.posthogHost).toBe('https://eu.i.posthog.com')
})

it('rejects a VITE_POSTHOG_HOST that is set to a non-URL', async () => {
  await expect(loadEnv({ VITE_POSTHOG_HOST: 'not a url' })).rejects.toThrow(
    /public environment/i,
  )
})

it('treats an empty VITE_POSTHOG_KEY as unconfigured', async () => {
  const env = await loadEnv({ VITE_POSTHOG_KEY: '' })
  expect(env.posthogKey).toBeUndefined()
})
