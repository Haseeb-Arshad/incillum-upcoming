import { afterEach, describe, expect, it, vi } from 'vitest'

import { captureWaitlistAttribution } from '#/lib/waitlist-attribution.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('captureWaitlistAttribution', () => {
  it('keeps the page, referrer host, and campaign tags without URL queries', () => {
    vi.stubGlobal('window', {
      location: {
        pathname: '/contact',
        search:
          '?utm_source=linkedin&utm_medium=social&utm_campaign=launch&email=private',
      },
    })
    vi.stubGlobal('document', {
      referrer: 'https://news.example/story?email=private#reply',
    })

    expect(captureWaitlistAttribution()).toEqual({
      sourcePath: '/contact',
      referrerHost: 'news.example',
      utmSource: 'linkedin',
      utmMedium: 'social',
      utmCampaign: 'launch',
    })
  })

  it('limits campaign values and returns an unknown source during server rendering', () => {
    vi.stubGlobal('window', {
      location: {
        pathname: '/'.repeat(300),
        search: `?utm_source=${'x'.repeat(140)}`,
      },
    })
    vi.stubGlobal('document', { referrer: '' })

    const attribution = captureWaitlistAttribution()

    expect(attribution.sourcePath).toHaveLength(255)
    expect(attribution.utmSource).toHaveLength(120)

    vi.unstubAllGlobals()
    expect(captureWaitlistAttribution()).toEqual({ sourcePath: 'unknown' })
  })

  it('ignores campaign tags that resemble a personal identifier', () => {
    vi.stubGlobal('window', {
      location: {
        pathname: '/contact',
        search: '?utm_source=private%40example.com&utm_medium=paid-social',
      },
    })
    vi.stubGlobal('document', { referrer: '' })

    expect(captureWaitlistAttribution()).toEqual({
      sourcePath: '/contact',
      referrerHost: undefined,
      utmSource: undefined,
      utmMedium: 'paid-social',
      utmCampaign: undefined,
    })
  })
})
