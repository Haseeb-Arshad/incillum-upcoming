import { expect, test } from '@playwright/test'

/**
 * The home page: night first, then morning.
 *
 * The rules under test are the ones the page lives under: one dark region; the
 * photograph never moves; the matrix and the thread are invented and say so
 * first; the matrix's figures are the thread's figures; nothing is claimed that
 * a pre-launch company cannot back; and one form, which never promises an
 * email to the person who used it.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
})

test('first screen: headline, one form, the photograph, and no horizontal overflow', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Intelligence for commercial work.',
  )
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.locator('form')).toHaveCount(1)
  await expect(page.locator('details')).toHaveCount(0)
  await expect(page.locator('.hero-plate img')).toBeVisible()
  await expect(page.locator('.hero-plate img')).toHaveAttribute('alt', /empty/)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('exactly one dark region, and the panel inside it is lit', async ({ page }) => {
  await expect(page.locator('[data-inverted]')).toHaveCount(1)
  await expect(page.locator('[data-inverted] [data-lit]')).toHaveCount(1)
})

test('the matrix is illustrative first, and agrees with the thread', async ({ page }) => {
  const section = page.locator('.home-matrix')
  // The licence: the section's first line says it is invented.
  await expect(section.locator('p').first()).toHaveText(/^Illustrative/)
  await expect(section.getByRole('table')).toHaveAccessibleName(/^Illustrative/)

  const table = section.getByRole('table')
  await expect(table.locator('tbody tr[data-status]')).toHaveCount(7)
  await expect(table.locator('tbody tr[data-status="held"]')).toHaveCount(2)
  await expect(table.getByText('13 more lines priced')).toBeVisible()

  // The panel's money is the thread's money.
  for (const figure of ['EUR 236,400.00', '16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(section).toContainText(figure)
    await expect(page.locator('#night')).toContainText(figure)
  }
})

test('nothing is claimed that cannot be backed', async ({ page }) => {
  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers include|testimonial|SOC 2|ISO 27001|HIPAA|GDPR|check your inbox|\+24%|\+18%|Mainland|Shenzhen|�/i,
  )
  // Nothing pulses: no element on the page runs an infinite animation.
  const infinite = await page.evaluate(() =>
    [...document.querySelectorAll('*')].filter(
      (element) => getComputedStyle(element).animationIterationCount === 'infinite',
    ).length,
  )
  expect(infinite).toBe(0)
})

test('the inline field keeps its name and validates', async ({ page }) => {
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await expect(email).toHaveAttribute('placeholder', 'Work email')
  await page.getByRole('button', { name: 'Request early access' }).click()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await email.fill('person@gmail.com')
  await email.press('Tab')
  await expect(page.getByText(/Use your work email/)).toBeVisible()
  await email.fill('director@northwind-trading.example')
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
})

test('network error keeps the entered address', async ({ page }) => {
  await page.route('**/*', (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await email.fill('director@northwind-trading.example')
  await page.getByRole('button', { name: 'Request early access' }).click()
  await expect(page.getByRole('alert')).toContainText('That did not send')
  await expect(email).toHaveValue('director@northwind-trading.example')
})

test('the masthead call to action puts the cursor in the field', async ({ page }) => {
  await page.getByRole('link', { name: 'Early access', exact: true }).click()
  await expect(page.getByRole('textbox', { name: /^Work email/ })).toBeFocused()
})

test('the night link, the memo and the address all land somewhere real', async ({ page }) => {
  await expect(page.locator('#night')).toHaveCount(1)
  await expect(page.locator('a[href="#night"]')).toHaveCount(1)
  await expect(page.locator('a[href="/contact"]').first()).toBeAttached()
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
    'href',
    /^mailto:.+@.+/,
  )
})

test('the motto appears once, and last', async ({ page }) => {
  const text = await page.locator('body').innerText()
  expect(text.match(/stay with the work/gi)).toHaveLength(1)
  await expect(page.getByRole('contentinfo')).toContainText('Stay with the work.')
})

test('server HTML carries the headline, the field and the licence without JavaScript', async ({
  browser,
}) => {
  const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3210'
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto(`${base}/`)
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeVisible()
  await expect(staticPage.locator('.home-matrix p').first()).toHaveText(/^Illustrative/)
  await context.close()
})

test('reduced motion renders the final frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  for (const selector of ['.home-form', '.home-lede', '.hero-header', '.home-line > span']) {
    const style = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const computed = getComputedStyle(element)
        return { opacity: computed.opacity, animation: computed.animationName }
      })
    expect(style, selector).toEqual({ opacity: '1', animation: 'none' })
  }
})

test('the photograph never moves', async ({ page }) => {
  const plate = page.locator('.hero-plate img')
  await page.waitForTimeout(1500)
  const before = await plate.boundingBox()
  await page.mouse.move(40, 40)
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 300)
  await page.mouse.wheel(0, -300)
  await page.waitForTimeout(800)
  expect(await plate.boundingBox()).toEqual(before)
})
