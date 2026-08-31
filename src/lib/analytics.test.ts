import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Analytics.
 *
 * Worth testing precisely because none of it is visible. A GTM snippet that
 * renders when it should not, or a `trackEvent` that throws on a page with no
 * container, both look exactly like a working site until somebody checks — and
 * the second one would take the form's success path down with it.
 *
 * `src/env.ts` is mocked rather than driven through `import.meta.env`, because
 * it validates once at module evaluation and caches; a test that set the
 * variable afterwards would be testing the cache.
 */

afterEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
  vi.doUnmock('#/env.ts')
})

async function loadAnalytics(gtmId: string | undefined) {
  vi.doMock('#/env.ts', () => ({
    gtmId,
    siteUrl: 'https://incillum.com',
    contactEmail: 'hello@incillum.com',
    absoluteUrl: (path: string) => `https://incillum.com${path}`,
  }))
  return import('#/lib/analytics.ts')
}

describe('when no container is configured', () => {
  it('renders no head script and no noscript iframe', async () => {
    const analytics = await loadAnalytics(undefined)
    expect(analytics.gtmHeadScript()).toBeNull()
    expect(analytics.gtmNoScriptSrc).toBeNull()
  })

  /**
   * The guarantee the form depends on. `waitlist-form.tsx` calls this inside
   * the success path with no try/catch, so a throw here would turn a completed
   * signup into an error message for the visitor.
   */
  it('swallows an event rather than throwing', async () => {
    const analytics = await loadAnalytics(undefined)
    vi.stubGlobal('window', {})
    expect(() => analytics.trackEvent('waitlist_join')).not.toThrow()
  })
})

describe('when a container is configured', () => {
  it('emits a loader carrying the container id', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234')
    const script = analytics.gtmHeadScript()

    expect(script).not.toBeNull()
    expect(script?.children).toContain('GTM-ABC1234')
    expect(script?.children).toContain('googletagmanager.com/gtm.js')
    // The dataLayer has to be created before the tag is inserted, or anything
    // pushed during load is dropped.
    expect(script?.children.indexOf("w[l]=w[l]||[]")).toBeLessThan(
      script?.children.indexOf('createElement') ?? -1,
    )
  })

  it('points the noscript iframe at the same container', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234')
    expect(analytics.gtmNoScriptSrc).toBe(
      'https://www.googletagmanager.com/ns.html?id=GTM-ABC1234',
    )
  })

  it('pushes the event and its payload onto the dataLayer', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234')
    const dataLayer: Array<Record<string, unknown>> = []
    vi.stubGlobal('window', { dataLayer })

    analytics.trackEvent('waitlist_join', { first_workflow: 'Payment runs and approvals' })

    expect(dataLayer).toEqual([
      { event: 'waitlist_join', first_workflow: 'Payment runs and approvals' },
    ])
  })

  /**
   * The signature only accepts `Record<string, string>`, so this is a guard
   * against the *shape* being widened later. If somebody types the payload as
   * `unknown` to push a whole form object, this is the test that should have
   * stopped them.
   */
  it('accepts only flat string values', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234')
    const dataLayer: Array<Record<string, unknown>> = []
    vi.stubGlobal('window', { dataLayer })

    analytics.trackEvent('waitlist_join', { first_workflow: 'not_answered' })

    const pushed = dataLayer[0] ?? {}
    for (const [key, value] of Object.entries(pushed)) {
      expect(typeof value, `${key} should be a string`).toBe('string')
    }
  })
})
