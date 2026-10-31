import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
  vi.doUnmock('#/env.ts')
})

async function loadAnalytics(
  gtmId: string | undefined,
  posthogKey: string | undefined = undefined,
) {
  vi.doMock('#/env.ts', () => ({
    gtmId,
    posthogKey,
    posthogHost: 'https://eu.i.posthog.com',
    siteUrl: 'https://incillum.com',
    contactEmail: 'hello@incillum.com',
    absoluteUrl: (path: string) => `https://incillum.com${path}`,
  }))
  return import('#/lib/analytics.ts')
}

describe('analytics configuration', () => {
  it('renders no script without an analytics key', async () => {
    const analytics = await loadAnalytics(undefined)

    expect(analytics.analyticsConfigured).toBe(false)
    expect(analytics.gtmHeadScript()).toBeNull()
    expect(analytics.posthogHeadScript()).toBeNull()
  })

  it('sets PostHog up for the site and turns replay on only after consent', async () => {
    const analytics = await loadAnalytics(undefined, 'phc_test1234')
    const script = analytics.posthogHeadScript()

    expect(analytics.analyticsConfigured).toBe(true)
    expect(script).not.toBeNull()
    expect(script?.children).toContain("defaults:'2026-08-30'")
    expect(script?.children).toContain('api_host:"https://eu.i.posthog.com"')
    expect(script?.children).toContain("person_profiles:'identified_only'")
    expect(script?.children).toContain("capture_pageview:'history_change'")
    expect(script?.children).toContain('capture_pageleave:true')
    expect(script?.children).toContain('capture_exceptions:true')
    expect(script?.children).toContain('capture_dead_clicks:true')
    expect(script?.children).toContain('rageclick:true')
    expect(script?.children).toContain('capture_heatmaps:true')
    expect(script?.children).toContain('capture_performance:true')
    expect(script?.children).toContain('capture_copied_text:false')
    expect(script?.children).toContain('disable_session_recording:false')
    expect(script?.children).toContain('maskAllInputs:true')
    expect(script?.children).toContain("maskTextSelector:'*'")
    expect(script?.children).toContain('recordBody:false')
    expect(script?.children).toContain('recordHeaders:false')
    expect(script?.children).toContain("path.indexOf('/brief/')===0")
    expect(script?.children.indexOf('window.posthog=e')).toBeLessThan(
      script?.children.indexOf('posthog.init') ?? -1,
    )
  })

  it('holds both analytics loaders until the visitor allows analytics', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234', 'phc_test1234')
    const injected: Array<{ id: string; textContent: string | null }> = []
    const documentMock = {
      getElementById: (id: string) => injected.find((script) => script.id === id) ?? null,
      createElement: () => ({ id: '', textContent: '' }),
      head: { append: (script: (typeof injected)[number]) => injected.push(script) },
    }
    const windowMock: {
      dataLayer?: unknown[]
      __incillumAnalyticsAllowed?: boolean
      dispatchEvent: ReturnType<typeof vi.fn>
    } = { dispatchEvent: vi.fn() }
    vi.stubGlobal('document', documentMock)
    vi.stubGlobal('window', windowMock)

    analytics.trackEvent('waitlist_join')
    expect(injected).toHaveLength(0)
    expect(windowMock.dataLayer).toBeUndefined()

    analytics.setAnalyticsConsent('granted')
    expect(injected.map((script) => script.id)).toEqual([
      'incillum-gtm-bootstrap',
      'incillum-posthog-bootstrap',
    ])
    expect(windowMock.__incillumAnalyticsAllowed).toBe(true)

    analytics.trackEvent('waitlist_join', { source_path: '/' })
    expect(windowMock.dataLayer).toContainEqual({
      event: 'waitlist_join',
      source_path: '/',
    })

    analytics.setAnalyticsConsent('denied')
    analytics.trackEvent('waitlist_join')
    expect(windowMock.__incillumAnalyticsAllowed).toBe(false)
    expect(
      windowMock.dataLayer?.filter((entry) => {
        return typeof entry === 'object' && entry !== null && 'event' in entry
      }),
    ).toHaveLength(1)
  })

  it('uses the configured GTM container and initializes Consent Mode before loading it', async () => {
    const analytics = await loadAnalytics('GTM-ABC1234')
    const script = analytics.gtmHeadScript()

    expect(analytics.analyticsConfigured).toBe(true)
    expect(script).not.toBeNull()
    expect(script?.children).toContain('GTM-ABC1234')
    expect(script?.children).toContain('googletagmanager.com/gtm.js')
    expect(script?.children.indexOf('w[l]=w[l]||[]')).toBeLessThan(
      script?.children.indexOf('createElement') ?? -1,
    )
  })

  it('does not throw when there is no browser or analytics instance', async () => {
    const analytics = await loadAnalytics(undefined)
    vi.stubGlobal('window', undefined)

    expect(() => analytics.trackEvent('waitlist_join')).not.toThrow()
    expect(() => analytics.startAnalytics()).not.toThrow()
    expect(() => analytics.stopAnalytics()).not.toThrow()
  })
})
