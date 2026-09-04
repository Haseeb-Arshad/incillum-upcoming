import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Server configuration parsing.
 *
 * The rule under test is the one a real deployment trips over: a host dashboard
 * and a copied `.env.example` both hand an unset variable to the process as the
 * empty string, not as absent. `''` must be read as "unset" — and, because the
 * parse is atomic, one empty line must not disable the features whose own
 * values are fine.
 */

const REAL_ENV = { ...process.env }

async function loadServerEnv(overrides: Record<string, string | undefined>) {
  for (const key of [
    'BREVO_API_KEY',
    'WAITLIST_NOTIFY_TO',
    'WAITLIST_NOTIFY_FROM',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]) {
    delete process.env[key]
  }
  Object.assign(process.env, overrides)
  const module = await import('#/server/env.ts')
  return module.serverEnv()
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  process.env = { ...REAL_ENV }
})

it('reads a fully set configuration', async () => {
  const env = await loadServerEnv({
    BREVO_API_KEY: 'xkeysib-abc',
    WAITLIST_NOTIFY_TO: 'team@incillum.com',
    WAITLIST_NOTIFY_FROM: 'waitlist@incillum.com',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  })

  expect(env).toMatchObject({
    BREVO_API_KEY: 'xkeysib-abc',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  })
  expect(console.error).not.toHaveBeenCalled()
})

describe('an empty string is read as unset', () => {
  it('does not disable the mail path just because the Supabase key line is empty', async () => {
    const env = await loadServerEnv({
      BREVO_API_KEY: 'xkeysib-abc',
      WAITLIST_NOTIFY_TO: 'team@incillum.com',
      WAITLIST_NOTIFY_FROM: 'waitlist@incillum.com',
      // Present but empty — the state a copied .env.example is in.
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    })

    // The atomic-parse bug this guards against dropped every value here.
    expect(env.BREVO_API_KEY).toBe('xkeysib-abc')
    expect(env.WAITLIST_NOTIFY_TO).toBe('team@incillum.com')
    expect(env.SUPABASE_URL).toBeUndefined()
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('treats every field the same way', async () => {
    const env = await loadServerEnv({
      BREVO_API_KEY: '',
      WAITLIST_NOTIFY_TO: '',
      WAITLIST_NOTIFY_FROM: '',
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    })

    expect(env).toEqual({})
    expect(console.error).not.toHaveBeenCalled()
  })
})

it('logs and disables rather than throwing on a malformed value', async () => {
  const env = await loadServerEnv({ WAITLIST_NOTIFY_TO: 'not-an-email' })

  // A visitor must still be able to join; the record just falls back to a log.
  expect(env).toEqual({})
  expect(console.error).toHaveBeenCalled()
})
