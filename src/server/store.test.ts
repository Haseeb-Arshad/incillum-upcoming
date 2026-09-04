import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WaitlistNotification } from '#/server/notify.ts'

/**
 * Waitlist persistence.
 *
 * The store is the durable copy of a signup, so the questions worth asking are
 * the same three the mailer's tests ask: does a real signup actually reach the
 * table, does a half-finished configuration fall back to logging rather than
 * throw on the first visitor, and does a rejection surface loudly enough to be
 * recoverable from the log.
 *
 * `fetch` is stubbed. A test that hit PostgREST would need a live project, would
 * write real rows, and would fail in CI for reasons unrelated to this code.
 */

const record: WaitlistNotification = {
  reference: 'IC-ABC123-XYZ',
  workEmail: 'Controller@Northwind.co',
  commercialWork: 'Industrial distribution',
  quoteVolume: '200 to 1,000 a month',
  company: 'Northwind Trading',
  role: 'Commercial Director',
  erp: 'not answered',
  pain: 'Matching customer part numbers to our own catalogue.',
  receivedAt: '2026-01-14T03:20:00.000Z',
}

const FULL_CONFIG = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
}

async function loadStore(config: Record<string, string | undefined>) {
  vi.doMock('#/server/env.ts', () => ({ serverEnv: () => config }))
  const module = await import('#/server/store.ts')
  return module.waitlistStore()
}

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.doUnmock('#/server/env.ts')
})

describe('with the store configured', () => {
  it('posts the row to PostgREST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const store = await loadStore(FULL_CONFIG)
    await store.save(record)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    // Trailing slash on the base URL is stripped so this can never double up,
    // and `on_conflict` names the column the upsert dedupes on.
    expect(url).toBe('https://project.supabase.co/rest/v1/waitlist?on_conflict=work_email')
    expect(init.method).toBe('POST')

    // Both header forms carry the key: PostgREST reads `apikey`, the gateway in
    // front of it reads the bearer token, and sending one without the other is
    // a 401 with no other symptom.
    const headers = init.headers as Record<string, string>
    expect(headers.apikey).toBe('service-role-test-key')
    expect(headers.authorization).toBe('Bearer service-role-test-key')
    // A repeat signup must be a no-op, not a 409.
    expect(headers.prefer).toContain('resolution=ignore-duplicates')

    expect(typeof init.body).toBe('string')
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    // snake_case columns, and the address lower-cased so the unique constraint
    // actually de-duplicates.
    expect(body.work_email).toBe('controller@northwind.co')
    expect(body.reference).toBe('IC-ABC123-XYZ')
    expect(body.commercial_work).toBe('Industrial distribution')
    expect(body.quote_volume).toBe('200 to 1,000 a month')
    expect(body.company).toBe('Northwind Trading')
    expect(body.role).toBe('Commercial Director')
    expect(body.received_at).toBe('2026-01-14T03:20:00.000Z')
  })

  /**
   * A refusal has to throw so the caller can log the full record. PostgREST
   * answers a missing table or an RLS denial with a 4xx and a JSON body, and
   * swallowing that is how a waitlist quietly stops being written.
   */
  it('throws with the response body when the write is refused', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response('{"message":"relation \\"public.waitlist\\" does not exist"}', {
              status: 404,
            }),
          ),
        ),
    )

    const store = await loadStore(FULL_CONFIG)
    await expect(store.save(record)).rejects.toThrow(/404.*does not exist/s)
  })

  /**
   * If the body cannot be read, the status must still make it into the error —
   * a thrown `TypeError` from `.text()` would replace a diagnosable failure
   * with a meaningless one.
   */
  it('still reports the status when the response body cannot be read', async () => {
    const unreadable = new Response('nope', { status: 500 })
    await unreadable.text()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(unreadable))

    const store = await loadStore(FULL_CONFIG)
    await expect(store.save(record)).rejects.toThrow(/500/)
  })
})

describe('with the store unconfigured', () => {
  /**
   * Each of these is a half-finished setup. Falling back to logging is right;
   * throwing on the first signup after a deploy is not.
   */
  it.each([
    ['nothing set', {}],
    ['a URL but no key', { SUPABASE_URL: 'https://project.supabase.co' }],
    ['a key but no URL', { SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key' }],
  ])('logs rather than writing when there is %s', async (_label, config) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const store = await loadStore(config)
    await store.save(record)

    expect(fetchMock).not.toHaveBeenCalled()
    // The record still has to exist somewhere.
    expect(console.info).toHaveBeenCalledWith(expect.any(String), record)
  })
})
