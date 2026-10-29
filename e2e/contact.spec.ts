import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The contact memo.
 *
 * It is the waitlist form on a different page, so the rules under test are the
 * waitlist's: only the address is required, nothing is sent to the person who
 * wrote, and the page claims nothing it cannot back. Every test that submits
 * does it against a stubbed server function — the suite runs against the built
 * app with whatever `.env` is on the machine, and a green test must never be a
 * row in somebody's database.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/contact')
  await page.waitForSelector('html[data-hydrated="true"]')
})

/**
 * The wire shape of `joinWaitlist`'s success, as TanStack Start serialises it.
 *
 * Copied from a real response, not written from the docs: 1.169 sends only
 * `result`, where 1.168 also sent `error` and `context`, and the client will not
 * read the old shape. When the framework moves again, capture one real
 * response from a local server with no providers configured and paste it here.
 */
const joined = {
  t: 10,
  i: 0,
  p: {
    k: ['result'],
    v: [
      {
        t: 10,
        i: 1,
        p: {
          k: ['status', 'reference'],
          v: [
            { t: 1, s: 'joined' },
            { t: 1, s: 'IC-TEST0001-ABC' },
          ],
        },
        o: 0,
      },
    ],
  },
  o: 0,
}

async function stubSuccess(page: Page) {
  await page.route('**/_serverFn/**', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json', 'x-tss-serialized': 'true' },
          body: JSON.stringify(joined),
        })
      : route.continue(),
  )
}

test('one sheet, one form, no proof column, and no horizontal overflow', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Tell us about the work that outlasts the day.',
  )
  await expect(page.locator('form')).toHaveCount(1)
  await expect(page.getByRole('combobox')).toHaveCount(2)
  await expect(page.locator('main img')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers|testimonial|SOC 2|GDPR|HIPAA|check your inbox|�/i,
  )
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('the page draws its own chrome, once', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
  await expect(page.locator('a[href="/"]').first()).toBeVisible()
})

test('a label lifts off the line and the field keeps its name', async ({ page }) => {
  const label = page.locator('label', { hasText: 'Work email' })
  const scale = () =>
    label.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)

  expect(await scale()).toBe(1)
  const email = page.getByRole('textbox', { name: 'Work email' })
  await email.fill('director@northwind-trading.example')
  await email.blur()
  await expect.poll(scale).toBeLessThan(1)
  // Still a real label, so the name survives the lift.
  await expect(email).toHaveAccessibleName('Work email')
})

test('only the address is required, and the error says why', async ({ page }) => {
  await page.getByRole('button', { name: 'Send to Incillum' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: /Enter an email address/ }),
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Work email' })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  for (const name of ['Company', 'Your role', 'Current ERP', /What costs you most/]) {
    await expect(page.getByRole('textbox', { name })).not.toHaveAttribute(
      'aria-invalid',
      'true',
    )
  }
  await expect(
    page.getByRole('combobox', { name: 'Kind of commercial work' }),
  ).not.toHaveAttribute('aria-invalid', 'true')

  const email = page.getByRole('textbox', { name: 'Work email' })
  await email.fill('person@gmail.com')
  await email.press('Tab')
  await expect(page.getByText(/Use your work email/)).toBeVisible()
  await email.fill('director@northwind-trading.example')
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
})

test('the select works from the keyboard and the pointer, and can be cleared', async ({
  page,
}) => {
  const kind = page.getByRole('combobox', { name: 'Kind of commercial work' })
  await expect(kind).toHaveAttribute('aria-expanded', 'false')

  await kind.focus()
  await kind.press('ArrowDown')
  await expect(kind).toHaveAttribute('aria-expanded', 'true')
  await expect(
    page.getByRole('listbox', { name: 'Kind of commercial work' }),
  ).toBeVisible()
  await kind.press('ArrowDown')
  await kind.press('Enter')
  await expect(kind).toHaveAttribute('aria-expanded', 'false')
  await expect(kind).toContainText('Industrial distribution')

  // Escape closes without choosing.
  await kind.press('ArrowDown')
  await kind.press('ArrowDown')
  await kind.press('Escape')
  await expect(kind).toContainText('Industrial distribution')

  // Pointer, on the other select.
  const volume = page.getByRole('combobox', { name: 'RFQs a month' })
  await volume.click()
  await page.getByRole('option', { name: '50 to 200 a month' }).click()
  await expect(volume).toContainText('50 to 200 a month')

  // The first option puts it back to nothing.
  await volume.click()
  await page.getByRole('option', { name: 'Skip this' }).click()
  await expect(volume).not.toContainText('50 to 200')
})

test('a network failure keeps what was typed and offers the email', async ({ page }) => {
  await page.route('**/*', (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  const email = page.getByRole('textbox', { name: 'Work email' })
  await email.fill('director@northwind-trading.example')
  await page.getByRole('textbox', { name: 'Company' }).fill('Northwind Trading')
  await page.getByRole('button', { name: 'Send to Incillum' }).click()

  const notice = page
    .getByRole('alert')
    .filter({ hasText: 'We couldn’t confirm delivery' })
  await expect(notice).toBeVisible()
  await expect(notice.getByRole('link', { name: /Email us/ })).toHaveAttribute(
    'href',
    /^mailto:.+@.+/,
  )
  await expect(email).toHaveValue('director@northwind-trading.example')
  await expect(page.getByRole('textbox', { name: 'Company' })).toHaveValue(
    'Northwind Trading',
  )
  await expect(page.getByRole('button', { name: 'Send to Incillum' })).toBeEnabled()
})

test('success stamps the copy, repeats the record and spends the motto once', async ({
  page,
}) => {
  await stubSuccess(page)

  await page
    .getByRole('textbox', { name: 'Work email' })
    .fill('director@northwind-trading.example')
  await page.getByRole('textbox', { name: 'Company' }).fill('Northwind Trading')
  await page.getByRole('combobox', { name: 'RFQs a month' }).click()
  await page.getByRole('option', { name: '200 to 1,000 a month' }).click()
  await page.getByRole('button', { name: 'Send to Incillum' }).click()

  const heading = page.getByRole('heading', { name: 'Received.' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()

  const receipt = page.getByRole('region', { name: 'Received.' })
  await expect(receipt).toContainText('IC-TEST0001-ABC')
  await expect(receipt).toContainText('Northwind Trading')
  await expect(receipt).toContainText('200 to 1,000 a month')
  // Only what was answered is repeated.
  await expect(receipt).not.toContainText('Current ERP')

  // The promise: we have it, we will write once — never a confirmation email.
  await expect(receipt).toContainText(/we’ll write once/i)
  await expect(page.locator('body')).not.toContainText(/check your inbox/i)
  await expect(page.locator('body')).toContainText(/stay with the work/i)
  expect(
    (await page.locator('body').innerText()).match(/stay with the work/gi),
  ).toHaveLength(1)

  // The stamp is decoration; the heading is the announcement.
  await expect(page.locator('.memo-stamp')).toHaveAttribute('aria-hidden', 'true')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)

  await page.getByRole('button', { name: 'Write another' }).click()
  // A blank form, with focus on its first field rather than lost with the receipt.
  await expect(page.getByRole('textbox', { name: 'Work email' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'Work email' })).toBeFocused()
})

test('reduced motion renders the final frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/contact')
  await page.waitForSelector('html[data-hydrated="true"]')
  for (const selector of ['.memo-brand', '.memo-paper']) {
    const style = await page.locator(selector).evaluate((element) => {
      const computed = getComputedStyle(element)
      return { opacity: computed.opacity, animation: computed.animationName }
    })
    expect(style, selector).toEqual({ opacity: '1', animation: 'none' })
  }
})

test('server HTML carries the heading and the address field without JavaScript', async ({
  browser,
}) => {
  const base =
    process.env.PLAYWRIGHT_BASE_URL ??
    `http://localhost:${process.env.PLAYWRIGHT_PORT ?? '3210'}`
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto(`${base}/contact`)
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: 'Work email' })).toBeVisible()
  await context.close()
})

test('the home page reaches it at every width, and the page is in the sitemap', async ({
  page,
  request,
}) => {
  await page.route('**/film/incillum.mp4', (route) => route.abort())
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.waitForSelector('html[data-hydrated="true"]')
  // The masthead's link is hidden on a phone and the footer's is not, so
  // whichever is visible has to land here.
  await page.locator('a[href="/contact"]:visible').first().click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/outlasts the day/)

  const sitemap = await request.get('/sitemap.xml')
  expect(await sitemap.text()).toContain('/contact</loc>')
})
