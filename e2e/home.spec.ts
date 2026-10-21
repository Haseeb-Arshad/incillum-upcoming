import { expect, test } from '@playwright/test'

/**
 * The home page: one quotation, told in eight acts.
 *
 * The rules under test are the ones the page lives under: one dark region; the
 * photograph never moves; the film and the tabs are invented and say so first;
 * their figures are the thread's figures; the four tabs are a real tablist and
 * end on the four places the work stops; the trust grid names no
 * certification; nothing is claimed that a pre-launch company cannot back; one
 * form, which never promises an email to the person who used it; and the
 * masthead stays with the reader.
 */
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3210'

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
  await expect(page.locator('[data-inverted] #film')).toHaveCount(1)
})

test('the film says it is invented first, and its money is the thread’s', async ({ page }) => {
  const film = page.locator('#film')
  await expect(film.getByRole('heading', { level: 2 }).first()).toHaveText(/invented/i)
  await film.getByRole('button', { name: /^06:50/ }).click()
  for (const figure of ['EUR 236,400.00', '16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(film.locator('.glass-sheet-ledger')).toContainText(figure)
  }
})

test('how it works is a real tablist, and each step ends where it stops', async ({ page }) => {
  const section = page.locator('#how')
  await expect(section.getByText(/invented quotation/)).toBeVisible()
  const tabs = section.getByRole('tab')
  await expect(tabs).toHaveCount(4)
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(section.getByRole('tabpanel')).toHaveCount(1)

  // The keyboard moves the selection and the focus together, and wraps.
  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowDown')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.nth(1)).toBeFocused()
  await page.keyboard.press('End')
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowUp')
  await expect(tabs.nth(3)).toBeFocused()
  await page.keyboard.press('Home')
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')

  // Every step names one of the four limits, and the four are each used once.
  const limits: string[] = []
  for (let index = 0; index < 4; index += 1) {
    await tabs.nth(index).click()
    const panel = section.getByRole('tabpanel')
    await expect(panel).toHaveAttribute('aria-labelledby', (await tabs.nth(index).getAttribute('id'))!)
    limits.push((await panel.locator('.how-stops-line strong').innerText()).replace(/\.$/, ''))
  }
  expect([...limits].sort()).toEqual(['Ambiguity', 'Approval', 'Commercial policy', 'Missing evidence'])
})

test('the tabs’ figures are the evidence document’s and the ledger’s', async ({ page }) => {
  const section = page.locator('#how')
  await section.getByRole('tab', { name: /Hold/ }).click()
  await expect(section.getByRole('tabpanel').locator('.matrix-status--held')).toHaveCount(2)

  await section.getByRole('tab', { name: /Price/ }).click()
  const price = section.getByRole('tabpanel')
  for (const figure of ['20.0%', '15.2%', 'EUR 160.00', 'EUR 11,520.00']) {
    await expect(price).toContainText(figure)
  }

  await section.getByRole('tab', { name: /Decide/ }).click()
  const decide = section.getByRole('tabpanel')
  for (const figure of ['EUR 169.60', '16.4%', 'EUR 10,638.00']) {
    await expect(decide).toContainText(figure)
  }
})

test('trust: six commitments with their real state, and no certification named', async ({
  page,
}) => {
  const section = page.locator('#trust')
  const cells = section.locator('.trust-cell')
  await expect(cells).toHaveCount(6)
  for (const state of await section.locator('.trust-state').allInnerTexts()) {
    expect(['DECIDED', 'BUILT', 'IN BUILD']).toContain(state.trim().toUpperCase())
  }
  await expect(section).toContainText('No certification is claimed on this page.')
  await expect(section).not.toContainText(/SOC|ISO|GDPR|CCPA|HIPAA|certified|compliant/)
})

test('questions are answered in full, with nothing folded away', async ({ page }) => {
  const section = page.locator('#questions')
  const answers = section.locator('.questions-answer')
  expect(await answers.count()).toBeGreaterThanOrEqual(5)
  for (const answer of await answers.all()) await expect(answer).toBeVisible()
  await expect(section.locator('details, [hidden]')).toHaveCount(0)
})

test('nothing is claimed that cannot be backed, and nothing pulses', async ({ page }) => {
  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers include|testimonial|SOC 2|ISO 27001|HIPAA|GDPR|check your inbox|NetSuite|\bSAP\b|Salesforce|Gmail|Outlook|\+24%|\+18%|Mainland|Shenzhen|�/i,
  )
  // Nothing pulses: no element on the page runs an infinite animation.
  const infinite = await page.evaluate(() =>
    [...document.querySelectorAll('*')].filter(
      (element) => getComputedStyle(element).animationIterationCount === 'infinite',
    ).length,
  )
  expect(infinite).toBe(0)
})

test('the signal stays where it is licensed: held lines and the figure under the floor', async ({
  page,
}) => {
  // Every tab once, so every panel has been drawn with its real styles.
  for (const name of ['Read', 'Hold', 'Price', 'Decide']) {
    await page.locator('#how').getByRole('tab', { name: new RegExp(name) }).click()
  }
  const strays = await page.evaluate(() => {
    const signal = new Set(['rgb(154, 85, 24)', 'rgb(228, 160, 70)'])
    const licensed = [
      '.matrix-status--held',
      '.glass-sheet-short',
      '.glass-thread-short',
      '.glass-handover-short',
      '.how-card-short',
      '.how-decide-short',
    ].join(', ')
    return [...document.querySelectorAll('body *')]
      .filter((element) => element.childElementCount === 0 && element.textContent?.trim())
      .filter((element) => signal.has(getComputedStyle(element).color))
      .filter((element) => !element.closest(licensed))
      .map((element) => element.textContent?.trim())
  })
  expect(strays).toEqual([])
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

test('the masthead stays with the reader, and fills in once the photograph has gone', async ({
  page,
}) => {
  const banner = page.getByRole('banner')
  await expect(banner).toHaveAttribute('data-scrolled', 'false')
  await page.locator('#trust').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(banner).toHaveAttribute('data-scrolled', 'true')
  const box = await banner.boundingBox()
  expect(box?.y).toBe(0)
  await expect(banner.getByRole('link', { name: 'Request early access' })).toBeInViewport()
})

test('every link lands somewhere real', async ({ page }) => {
  const anchors = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')!.slice(1)),
  )
  expect(anchors.length).toBeGreaterThan(0)
  for (const id of new Set(anchors)) {
    await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1)
  }
  await expect(page.locator('a[href="/contact"]').first()).toBeAttached()
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', /^mailto:.+@.+/)
  await expect(page.locator('a[href="/glass"]')).toHaveCount(0)
})

test('the motto appears once, and last', async ({ page }) => {
  const text = await page.locator('body').innerText()
  expect(text.match(/stay with the work/gi)).toHaveLength(1)
  await expect(page.getByRole('contentinfo')).toContainText('Stay with the work.')
})

test('server HTML carries the headline, the field, the licence and every step without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto(`${base}/`)
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeVisible()
  await expect(staticPage.locator('#film h2').first()).toHaveText(/invented/i)
  // Without a script the four steps are simply listed, each with its heading.
  await expect(staticPage.locator('#how .how-panel-heading')).toHaveCount(4)
  for (const panel of await staticPage.locator('#how .how-panel').all()) {
    await expect(panel).toBeVisible()
  }
  await expect(staticPage.locator('#trust .trust-cell')).toHaveCount(6)
  await expect(staticPage.locator('#questions .questions-answer').first()).toBeVisible()
  await context.close()
})

test('reduced motion renders the final frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]')
  for (const selector of ['.home-form', '.home-lede', '.home-bar', '.home-line > span']) {
    const style = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const computed = getComputedStyle(element)
        return { opacity: computed.opacity, animation: computed.animationName }
      })
    expect(style, selector).toEqual({ opacity: '1', animation: 'none' })
  }
  // A tab change is a swap, not a fade: nothing longer than the site's 0.01ms backstop.
  await page.locator('#how').getByRole('tab', { name: /Price/ }).click()
  const panel = page.locator('#how').getByRole('tabpanel')
  const durations = await panel.evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(',').map((value) => parseFloat(value)),
  )
  for (const seconds of durations) expect(seconds).toBeLessThan(0.001)
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
