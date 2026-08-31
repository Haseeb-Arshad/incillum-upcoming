import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WaitlistNotification } from '#/server/notify.ts'

/**
 * Waitlist delivery.
 *
 * Until there is a database this path *is* the store, so the questions worth
 * asking are: does a real signup actually leave the building, does a
 * half-finished configuration fail safe rather than silently, and does a
 * provider outage surface loudly enough to be recoverable.
 *
 * `fetch` is stubbed rather than hit. A test that called Resend would need a
 * live key, would send real mail, and would fail in CI for reasons that have
 * nothing to do with this code.
 */

const notification: WaitlistNotification = {
  reference: 'IC-ABC123-XYZ',
  workEmail: 'controller@northwind.co',
  firstWorkflow: 'Payment runs and approvals',
  receivedAt: '2026-01-14T03:20:00.000Z',
}

const FULL_CONFIG = {
  RESEND_API_KEY: 're_test_key',
  WAITLIST_NOTIFY_TO: 'team@incillum.com',
  WAITLIST_NOTIFY_FROM: 'waitlist@incillum.com',
}

async function loadNotifier(config: Record<string, string | undefined>) {
  vi.doMock('#/server/env.ts', () => ({ serverEnv: () => config }))
  const module = await import('#/server/notify.ts')
  return module.waitlistNotifier()
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

describe('with the provider configured', () => {
  it('posts the record to Resend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const notifier = await loadNotifier(FULL_CONFIG)
    await notifier.send(notification)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.method).toBe('POST')

    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer re_test_key')

    // `BodyInit` includes streams and blobs, so `String()` on it is a lint
    // error waiting to produce '[object Object]'. The mock is handed a string
    // by the code under test, and asserting that first is what makes the cast
    // honest rather than convenient.
    expect(typeof init.body).toBe('string')
    const payload = JSON.parse(init.body as string) as Record<string, unknown>
    expect(payload.from).toBe('waitlist@incillum.com')
    expect(payload.to).toEqual(['team@incillum.com'])
    // Replying to the notification has to reach the person who joined —
    // otherwise answering somebody is a copy-paste out of the body.
    expect(payload.reply_to).toBe('controller@northwind.co')
    expect(String(payload.text)).toContain('IC-ABC123-XYZ')
    expect(String(payload.text)).toContain('controller@northwind.co')
    expect(String(payload.text)).toContain('Payment runs and approvals')
  })

  /**
   * A refusal has to throw so the caller can log the full record. Resend
   * answers an unverified sending domain with a 4xx and a JSON explanation, and
   * swallowing that is how a waitlist quietly stops working.
   */
  it('throws with the provider’s explanation when the send is refused', async () => {
    // A fresh Response per call, not one shared instance: a body can only be
    // read once, so a reused Response makes the second assertion measure the
    // `<unreadable>` fallback instead of the code under test.
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response('{"message":"domain is not verified"}', { status: 403 }),
          ),
        ),
    )

    const notifier = await loadNotifier(FULL_CONFIG)
    // One call, both assertions — the status tells you where to look and the
    // body tells you what to fix, and losing either sends somebody to the
    // Resend dashboard for no reason.
    await expect(notifier.send(notification)).rejects.toThrow(/403.*not verified/s)
  })

  /**
   * The fallback the test above originally tripped over by accident. If the
   * body cannot be read, the status must still make it into the error — a
   * thrown `TypeError` from `.text()` would replace a diagnosable failure with
   * a meaningless one.
   */
  it('still reports the status when the response body cannot be read', async () => {
    const unreadable = new Response('nope', { status: 500 })
    await unreadable.text()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(unreadable))

    const notifier = await loadNotifier(FULL_CONFIG)
    await expect(notifier.send(notification)).rejects.toThrow(/500/)
  })
})

describe('with the provider unconfigured', () => {
  /**
   * Every one of these is a half-finished setup. Falling back to logging is
   * right; quietly sending to some default would be worse than doing nothing.
   */
  it.each([
    ['nothing set', {}],
    ['a key but no destination', { RESEND_API_KEY: 're_test_key' }],
    ['no sender', { RESEND_API_KEY: 're_test_key', WAITLIST_NOTIFY_TO: 'team@incillum.com' }],
  ])('logs rather than sending when there is %s', async (_label, config) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const notifier = await loadNotifier(config)
    await notifier.send(notification)

    expect(fetchMock).not.toHaveBeenCalled()
    // The record still has to exist somewhere. Falling back must not mean
    // losing the signup.
    expect(console.info).toHaveBeenCalledWith(expect.any(String), notification)
  })
})
