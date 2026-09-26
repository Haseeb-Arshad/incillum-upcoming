import { expect, test } from '@playwright/test'

/**
 * The harbour edition — the public home page.
 *
 * The picture is one raster with commercial figures drawn into its cards. The
 * rule it lives under is that those figures stay in the picture: decorative,
 * hidden from assistive technology, and never repeated as the page's own text.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
})

test('first screen: headline, one form, picture, and no horizontal overflow', async ({
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
  await expect(page.locator('.home-art img')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('the figures in the picture stay in the picture', async ({ page }) => {
  const art = page.locator('.home-art')
  await expect(art).toHaveAttribute('aria-hidden', 'true')
  await expect(art.locator('img')).toHaveAttribute('alt', '')
  await expect(page.locator('body')).not.toContainText(
    /\+24%|\+18%|12 weeks|Mainland|Shenzhen|check your inbox|�/i,
  )
})

test('the inline field keeps its name and validates', async ({ page }) => {
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await expect(email).toHaveAttribute('placeholder', 'Your work email')
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
  await page.getByRole('link', { name: 'Request early access' }).click()
  await expect(page.getByRole('textbox', { name: /^Work email/ })).toBeFocused()
})

test('Approach and Contact both land somewhere real', async ({ page }) => {
  await expect(page.locator('#approach')).toHaveCount(1)
  await expect(page.locator('a[href="#approach"]')).toHaveCount(1)
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
    'href',
    /^mailto:.+@.+/,
  )
})

test('server HTML carries the headline and the field without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto('http://localhost:3210/')
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeVisible()
  await context.close()
})

test('reduced motion renders the final frame', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  for (const selector of ['.home-form', '.home-lede', '.home-header', '.home-plate img']) {
    const style = await page
      .locator(selector)
      .evaluate((element) => {
        const computed = getComputedStyle(element)
        return { opacity: computed.opacity, animation: computed.animationName }
      })
    expect(style, selector).toEqual({ opacity: '1', animation: 'none' })
  }
})

test('the picture never moves with the pointer', async ({ page }) => {
  const plate = page.locator('.home-plate')
  await page.waitForTimeout(2200)
  const before = await plate.boundingBox()
  await page.mouse.move(40, 40)
  await page.mouse.move(700, 400)
  await page.waitForTimeout(1500)
  expect(await plate.boundingBox()).toEqual(before)
})
