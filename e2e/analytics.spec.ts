import { expect, test } from '@playwright/test'

const consentKey = 'incillum-analytics-consent-v1'

test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  )
  await page.route('https://us-assets.i.posthog.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  )
  await page.route('https://us.i.posthog.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  )
})

test('holds analytics until a visitor allows it, then keeps the choice changeable', async ({
  page,
}) => {
  await page.goto('/')
  const consent = page.locator('.analytics-consent')

  await expect(consent).toBeVisible()
  await expect(page.locator('#incillum-posthog-bootstrap')).toHaveCount(0)
  await expect(page.locator('#incillum-gtm-bootstrap')).toHaveCount(0)
  await expect(page.locator('script[src*="posthog.com"]')).toHaveCount(0)

  await consent.getByRole('button', { name: 'Decline' }).click()
  await expect(consent).toHaveCount(0)
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), consentKey))
    .toBe('denied')

  await page.reload()
  await expect(page.locator('.analytics-consent')).toHaveCount(0)
  await expect(page.locator('script[src*="posthog.com"]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Privacy settings' }).click()
  await expect(page.locator('.analytics-consent')).toBeVisible()
  await page
    .locator('.analytics-consent')
    .getByRole('button', { name: 'Allow analytics' })
    .click()
  await expect(page.locator('#incillum-posthog-bootstrap')).toHaveCount(1)
  await expect(page.locator('#incillum-gtm-bootstrap')).toHaveCount(1)

  await page.getByRole('button', { name: 'Privacy settings' }).click()
  await page
    .locator('.analytics-consent')
    .getByRole('button', { name: 'Decline' })
    .click()
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), consentKey))
    .toBe('denied')
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __incillumAnalyticsAllowed?: boolean })
          .__incillumAnalyticsAllowed,
    ),
  ).toBe(false)
})

test('starts masked session replay and the useful PostHog web features after opt-in', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .locator('.analytics-consent')
    .getByRole('button', { name: 'Allow analytics' })
    .click()

  await expect(page.locator('#incillum-posthog-bootstrap')).toHaveCount(1)
  await expect(page.locator('#incillum-gtm-bootstrap')).toHaveCount(1)
  await expect(
    page.locator('script[src*="us-assets.i.posthog.com/static/array.js"]'),
  ).toHaveCount(1)
  await expect(page.locator('script[src*="googletagmanager.com/gtm.js"]')).toHaveCount(1)

  const consentCalls = await page.evaluate(() =>
    ((window as Window & { dataLayer?: unknown[] }).dataLayer ?? []).filter(
      (entry): entry is unknown[] => Array.isArray(entry) && entry[0] === 'consent',
    ),
  )
  expect(consentCalls).toContainEqual([
    'consent',
    'default',
    {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ])
  expect(consentCalls).toContainEqual([
    'consent',
    'update',
    {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ])

  const config = await page.evaluate(() => {
    const posthog = (
      window as Window & {
        posthog?: { _i?: Array<[string, Record<string, unknown>]> }
      }
    ).posthog
    return posthog?._i?.find((entry) => entry[0] === 'phc_playwright')?.[1] ?? null
  })

  expect(config).not.toBeNull()
  expect(config?.capture_pageview).toBe('history_change')
  expect(config?.capture_pageleave).toBe(true)
  expect(config?.capture_exceptions).toBe(true)
  expect(config?.capture_dead_clicks).toBe(true)
  expect(config?.capture_heatmaps).toBe(true)
  expect(config?.capture_performance).toBe(true)
  expect(config?.disable_session_recording).toBe(false)
  expect(config?.disable_surveys).toBe(false)
  expect(config?.enable_recording_console_log).toBe(false)
  expect(config?.session_recording).toMatchObject({
    maskAllInputs: true,
    maskTextSelector: '*',
    recordBody: false,
    recordHeaders: false,
  })
  await expect(
    page.locator('form.ph-no-autocapture[data-ph-private="true"]'),
  ).toHaveCount(1)
})

test('does not initialize analytics on the private brief', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'granted'), consentKey)
  await page.goto('/brief')

  await expect(page.locator('#incillum-posthog-bootstrap')).toHaveCount(0)
  await expect(page.locator('#incillum-gtm-bootstrap')).toHaveCount(0)
  await expect(page.locator('main.ph-no-capture')).toHaveCount(1)
})

test('keeps the consent panel inside each tested viewport', async ({ page }) => {
  await page.goto('/')

  const viewportWidth = page.viewportSize()?.width ?? 0
  const box = await page.locator('.analytics-consent').boundingBox()

  expect(box).not.toBeNull()
  expect(box?.x).toBeGreaterThanOrEqual(0)
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(viewportWidth)
})
