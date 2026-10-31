/**
 * Small, first-party attribution for a waitlist submission.
 *
 * Keep the page path and referrer host, plus standard campaign tags. Do not
 * store the full URL, query string, cookies, IP address, or user agent here.
 */
export interface WaitlistAttribution {
  sourcePath: string
  referrerHost?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

const MAX_CAMPAIGN_VALUE = 120

function campaignValue(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim().slice(0, MAX_CAMPAIGN_VALUE)
  return value && /^[\p{L}\p{N} ._-]+$/u.test(value) ? value : undefined
}

/** Read attribution only when the visitor submits, without adding form fields. */
export function captureWaitlistAttribution(): WaitlistAttribution {
  if (typeof window === 'undefined') return { sourcePath: 'unknown' }

  const referrer = document.referrer
  let referrerHost: string | undefined

  try {
    const parsed = new URL(referrer)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      referrerHost = parsed.host.slice(0, 255)
    }
  } catch {
    // An empty or non-URL referrer means the visit has no referrer host.
  }

  const params = new URLSearchParams(window.location.search)
  const sourcePath = window.location.pathname.startsWith('/')
    ? window.location.pathname.slice(0, 255)
    : 'unknown'

  return {
    sourcePath,
    referrerHost,
    utmSource: campaignValue(params, 'utm_source'),
    utmMedium: campaignValue(params, 'utm_medium'),
    utmCampaign: campaignValue(params, 'utm_campaign'),
  }
}
