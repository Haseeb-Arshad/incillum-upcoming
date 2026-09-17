import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
})

test('minimal launch surface, responsive layout, and no disclosure', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A different kindof intelligence.',
  )
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.locator('form')).toHaveCount(1)
  await expect(page.locator('details')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(
    /RFQ|supplier|quotation|margin|check your inbox|\uFFFD/i,
  )
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('validates an email and clears errors after correction', async ({ page }) => {
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await page.getByRole('button', { name: 'Join the waitlist' }).click()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await email.fill('person@gmail.com')
  await email.press('Tab')
  await expect(page.getByText(/Use your work email/)).toBeVisible()
  await email.fill('director@northwind-trading.example')
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
})

test('pending state and network error keep the entered address', async ({ page }) => {
  let release: (() => void) | undefined
  await page.route('**/*', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await new Promise<void>((resolve) => {
      release = resolve
    })
    await route.abort('failed')
  })
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await email.fill('director@northwind-trading.example')
  await page.getByRole('button', { name: 'Join the waitlist' }).click()
  await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled()
  await expect.poll(() => Boolean(release)).toBe(true)
  release!()
  await expect(page.getByRole('alert')).toContainText('That did not send')
  await expect(email).toHaveValue('director@northwind-trading.example')
  await expect(page.getByRole('button', { name: 'Join the waitlist' })).toBeEnabled()
})

test('local server accepts email-only signup and shows truthful success', async ({
  page,
}) => {
  // Run only against the local server with delivery/storage credentials removed.
  await page
    .getByRole('textbox', { name: /^Work email/ })
    .fill('director@northwind-trading.example')
  await page.waitForTimeout(2400)
  await page.getByRole('button', { name: 'Join the waitlist' }).click()
  await expect(page.getByRole('status')).toContainText('on the list')
  await expect(page.getByRole('status')).toContainText('We have your address')
  await expect(page.getByRole('status')).not.toContainText(/workflow|case|inbox/)
})

test('particles flow without controls and reduced motion renders a still frame', async ({
  page,
}) => {
  const field = page.locator('.intelligence-field')
  const canvas = field.locator('canvas')
  await expect(field).toHaveAttribute('data-ready', 'true')
  await expect(field).toHaveAttribute('data-motion', 'flowing')
  await expect(page.getByRole('button', { name: /pause|resume/i })).toHaveCount(0)
  const movingFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  )
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(movingFrame)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(field).toHaveAttribute('data-motion', 'still')
  const stillFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  )
  await page.waitForTimeout(250)
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(
    stillFrame,
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(field).toHaveAttribute('data-motion', 'flowing')
})

test('keyboard reaches form and server HTML contains the invitation', async ({
  page,
  browser,
}) => {
  await page.getByRole('textbox', { name: /^Work email/ }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Join the waitlist' })).toBeFocused()
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto('http://localhost:3210/')
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeVisible()
  await expect(staticPage.locator('.intelligence-field-still')).toBeVisible()
  await context.close()
})

test('share image matches declared PNG dimensions', async ({ page, request }) => {
  const url = await page.locator('meta[property="og:image"]').getAttribute('content')
  const response = await request.get(new URL(url!).pathname)
  expect(response.ok()).toBe(true)
  const bytes = await response.body()
  expect(bytes.readUInt32BE(16)).toBe(1200)
  expect(bytes.readUInt32BE(20)).toBe(630)
})
