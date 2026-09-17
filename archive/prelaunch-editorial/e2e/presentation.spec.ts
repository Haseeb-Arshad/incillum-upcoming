import { expect, test } from '@playwright/test'

test('explains the commercial consequence and exposes its working by keyboard', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const section = page.locator('section[aria-labelledby="evidence-heading"]')
  await expect(section.getByRole('group')).toContainText('20.0%')
  await expect(section.getByRole('group')).toContainText('15.2%')
  await expect(section.getByText('EUR 11,520.00', { exact: true }).first()).toBeVisible()
  await expect(section.getByRole('table')).toHaveCount(0)
  const summary = section.locator('summary')
  await summary.focus()
  await summary.press('Enter')
  await expect(section.getByRole('table')).toBeVisible()
  await expect(section.getByRole('table')).toContainText('EUR 203,520.00')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true)
  await expect(page.getByText('Honest about what exists.')).toHaveCount(0)
  await expect(section.locator('.ic-evidence-intro')).toHaveCSS('opacity', '1')
  await section.screenshot({ path: testInfo.outputPath('evidence.png') })
})

test('keeps the original fonts and a clear email-first invitation', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('#hero-heading')).toHaveCSS('font-family', /Incillum Serif/)
  await expect(page.locator('body')).toHaveCSS('font-family', /Incillum Sans/)
  await expect(page.locator('.ic-hero')).not.toContainText('Commercial operations')
  await expect(page.locator('#waitlist').getByRole('combobox')).toHaveCount(0)
  const headingFits = await page
    .locator('.ic-hero-line')
    .evaluateAll((lines) =>
      lines.every((line) => line.scrollWidth <= line.clientWidth + 1),
    )
  expect(headingFits, 'Neither headline line is clipped').toBe(true)
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(page.locator('#waitlist button[type="submit"]')).toBeInViewport()
  }
  await page.screenshot({ path: testInfo.outputPath('hero.png') })
})

test('has no overflow late at night in a long timezone', async ({
  browser,
  baseURL,
  page,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: page.viewportSize(),
    timezoneId: 'America/Argentina/Buenos_Aires',
    reducedMotion: 'reduce',
  })
  try {
    const night = await context.newPage()
    await night.clock.setFixedTime(new Date('2026-01-15T02:55:00Z'))
    await night.goto('/')
    await expect(night.getByText(/It is\s*23:55\s*where you are/)).toBeVisible()
    await night.evaluate(() => document.fonts.ready)
    expect(
      await night.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true)
  } finally {
    await context.close()
  }
})

test('renders final states immediately with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  const states = await page
    .locator('.ic-reveal, .ic-hero-line > span, .ic-enter')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node)
        return {
          opacity: style.opacity,
          transform: style.transform,
          animation: style.animationName,
        }
      }),
    )
  for (const state of states) {
    expect(state).toEqual({ opacity: '1', transform: 'none', animation: 'none' })
  }
})

test('keeps the narrative readable without JavaScript', async ({
  browser,
  baseURL,
  page,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: page.viewportSize(),
  })
  try {
    const document = await context.newPage()
    await document.goto('/')
    await expect(document.locator('#hero-heading')).toBeVisible()
    await expect(document.locator('#thread-heading')).toHaveCSS('opacity', '1')
    await expect(document.locator('.ic-reveal').first()).toHaveCSS('opacity', '1')
    await document.locator('#waitlist summary').click()
    await expect(
      document.locator('#waitlist').getByRole('textbox', { name: /^Company/ }),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test('shows pending feedback and preserves the email after a network failure', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  let failRequest: (() => void) | undefined
  await page.route('**/*', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await new Promise<void>((resolve) => {
      failRequest = resolve
    })
    await route.abort('failed')
  })
  const form = page.locator('#waitlist')
  const email = form.getByRole('textbox', { name: /^Work email/ })
  await email.fill('review@incillum.example')
  await form.getByRole('button', { name: /Join early access/ }).click()
  await expect(form.getByRole('button', { name: 'Sending…' })).toBeDisabled()
  await expect.poll(() => Boolean(failRequest)).toBe(true)
  failRequest!()
  await expect(form.getByRole('alert')).toContainText('Try again')
  await expect(email).toHaveValue('review@incillum.example')
  await expect(form.getByRole('button', { name: /Join early access/ })).toBeEnabled()
})

test('preserves the JANUS route with the shared typography', async ({ page }) => {
  await page.goto('/work/janus')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true)
})
