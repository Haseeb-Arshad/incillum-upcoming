import { expect, test } from '@playwright/test'

import type { Browser, Page } from '@playwright/test'

/**
 * The site, end to end.
 *
 * Three things are covered, and only one of them is the form.
 *
 * The **page** half checks what would break silently: the landmarks, the skip
 * link, and the absence of a product navigation this site is not supposed to
 * have.
 *
 * The **clock** half covers the one value the server cannot produce. Pinned to
 * a fixed instant so an assertion does not depend on when the suite runs.
 *
 * The **form** half exercises the real server function: validation on both
 * sides, the accessible error wiring, and the success state. Fields are queried
 * by role and accessible name rather than `getByLabel`, which matches ARIA
 * labelling generally rather than only `<label for>` associations and can be
 * won by an unrelated landmark elsewhere on the page.
 */

/**
 * The server rejects anything submitted within two seconds of the form becoming
 * usable (`lib/spam.ts`). A script is faster than a person; the wait is what
 * makes an assertion below a test of the success path rather than of the
 * honeypot response, which deliberately returns the same shape.
 */
const PAST_SPAM_GATE_MS = 2_400

async function ready(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 15_000 })
}

function emailField(page: Page) {
  return page.getByRole('textbox', { name: /^Work email/ })
}

function submit(page: Page) {
  return page.getByRole('button', { name: /Join the waitlist/ })
}

test.describe('the page', () => {
  test('leads with the argument and carries its landmarks', async ({ page }) => {
    await ready(page)

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Finance work doesn’t keep office hours/,
      }),
    ).toBeVisible()

    /**
     * The masthead and colophon are rendered from `__root.tsx` as siblings of
     * `<main>`. Moving them inside the page component would nest a `<header>`
     * in `<main>`, where it is not a `banner` landmark at all — the page would
     * look identical and quietly lose two of its three landmarks. This is the
     * assertion that fails if somebody does that.
     */
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('link', { name: /Skip to main content/ })).toHaveCount(1)
  })

  test('has no product navigation to leave through', async ({ page }) => {
    await ready(page)

    for (const label of ['Platform', 'Solutions', 'Customers', 'Resources', 'Pricing']) {
      await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(0)
    }
  })

  /**
   * The site is public now. A page anybody can reach that calls itself private
   * is either lying or telling the visitor they are not the audience, and
   * "private preview" is exactly the phrase that creeps back in one careless
   * edit at a time.
   */
  test('does not describe itself as private', async ({ page }) => {
    await ready(page)
    const body = (await page.locator('body').innerText()).toLowerCase()
    expect(body).not.toContain('private preview')
    expect(body).not.toContain('invitation only')
  })

  test('claims nothing it cannot evidence', async ({ page }) => {
    await ready(page)
    const body = (await page.locator('body').innerText()).toLowerCase()

    // AGENTS-style discipline, enforced rather than remembered: a pre-launch
    // site has no customers and no numbers, and the words that smuggle them in
    // arrive one careless edit at a time.
    for (const forbidden of ['trusted by', 'customers love', 'fully autonomous', 'revolutionary']) {
      expect(body).not.toContain(forbidden)
    }
  })

  /**
   * The one mock-up on a site that shows no screenshots.
   *
   * It is allowed to exist because it says what it is in its own first line, in
   * the server's HTML, at reading size — not in small print under the panel
   * where nobody looks. That sentence is the whole licence for the block, so it
   * is asserted here as well as in the unit tests: those cover the content
   * file, this covers what actually reaches a stranger's browser.
   */
  test('labels its example output as invented', async ({ page, request }) => {
    await ready(page)

    await expect(page.getByRole('heading', { name: /What is waiting when you get in/ })).toBeVisible()
    await expect(page.getByText(/Invented, and not a screenshot/)).toBeVisible()

    const html = await (await request.get('/')).text()
    expect(html).toContain('Invented, and not a screenshot')
  })

  test('serves robots and a sitemap that agree on the origin', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    const robotsBody = await robots.text()
    expect(robotsBody).toContain('User-agent: *')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('<urlset')

    const declared = /Sitemap: (\S+)/.exec(robotsBody)?.[1]
    expect(declared).toBeTruthy()
    expect(declared).toContain('/sitemap.xml')
  })

  /**
   * The suite runs with no `VITE_GTM_ID`, which is also how a preview
   * deployment and every developer's machine run. Nothing analytics-shaped may
   * reach the page in that state: no loader, no iframe, no third-party request,
   * no cookie. This is the test that fails if somebody hard-codes a container
   * ID rather than configuring one.
   */
  test('ships no analytics when no container is configured', async ({ page, request }) => {
    const thirdParty: Array<string> = []
    page.on('request', (req) => {
      if (new URL(req.url()).hostname.endsWith('googletagmanager.com')) {
        thirdParty.push(req.url())
      }
    })

    await ready(page)

    expect(thirdParty).toEqual([])
    await expect(page.locator('iframe[title="Google Tag Manager"]')).toHaveCount(0)
    expect(await (await request.get('/')).text()).not.toContain('googletagmanager.com')
  })

  test('boots cleanly, with no console errors and no horizontal overflow', async ({ page }) => {
    const errors: Array<string> = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await ready(page)

    expect(errors).toEqual([])

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('the clock', () => {
  /** A January date, so British Summer Time cannot move any of these. */
  async function pageAt(browser: Browser, iso: string) {
    const context = await browser.newContext({
      timezoneId: 'Europe/London',
      locale: 'en-GB',
    })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date(iso))
    await ready(page)
    return { context, page }
  }

  test('reads the visitor’s own hour', async ({ browser }) => {
    const { context, page } = await pageAt(browser, '2026-01-14T03:20:00Z')

    await expect(page.getByText(/It is\s*03:20\s*where you are/)).toBeVisible()

    await context.close()
  })

  /**
   * The reason this plate was rebuilt, kept as a test so it cannot quietly
   * revert.
   *
   * The first version captioned itself from the reader's clock — "your team is
   * at their desks" by day, "nobody is at their desks" at night — which meant
   * that for the whole of a working day the page's one live element argued
   * against the page's own thesis. A visitor at 16:28 was told by the drawing
   * that the hours were covered.
   *
   * The caption now states a proportion that is true at every hour. These two
   * assertions are the same sentence read at 03:20 and at 16:28, and the second
   * one is the one that used to fail.
   */
  test('makes the same argument at 03:20 and at 16:28', async ({ browser }) => {
    const night = await pageAt(browser, '2026-01-14T03:20:00Z')
    await expect(
      night.page.getByText(/Fifteen of these twenty-four hours have nobody in them/),
    ).toBeVisible()
    await night.context.close()

    const afternoon = await pageAt(browser, '2026-01-14T16:28:00Z')
    await expect(
      afternoon.page.getByText(/Fifteen of these twenty-four hours have nobody in them/),
    ).toBeVisible()
    await expect(afternoon.page.getByText(/It is\s*16:28\s*where you are/)).toBeVisible()

    // The claim that used to sit here in the middle of the afternoon.
    const body = await afternoon.page.locator('body').innerText()
    expect(body).not.toContain('at their desks')
    await afternoon.context.close()
  })

  /**
   * The section around the clock has to be readable before — and without — the
   * clock, because the server cannot render it. This asserts the words are in
   * the server's HTML rather than only appearing after hydration, and that
   * includes the sentence carrying the whole point of the plate: only the
   * closing "it is HH:MM where you are" clause may wait for a browser.
   */
  test('renders its section on the server, clock or no clock', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('Fifteen hours a day')
    expect(html).toContain('Your team')
    expect(html).toContain('Fifteen of these twenty-four hours have nobody in them')
  })
})

test.describe('the waitlist form', () => {
  test('blocks an empty submission and marks the field invalid', async ({ page }) => {
    await ready(page)

    await submit(page).click()

    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText(/You are on the waitlist/)).toHaveCount(0)
  })

  test('rejects a personal address with an explanation', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('someone@gmail.com')
    await emailField(page).blur()

    await expect(page.getByText(/work email address/i)).toBeVisible()
  })

  test('clears the error once the address is corrected', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('someone@gmail.com')
    await emailField(page).blur()
    await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true')

    await emailField(page).fill('controller@northwind-trading.example')
    await expect(emailField(page)).not.toHaveAttribute('aria-invalid', 'true')
  })

  /**
   * The whole point of the second field is that it is optional, and "make the
   * select required" is the single most likely well-meaning change anybody will
   * make to this form. This is the test that fails when they do.
   */
  test('accepts a submission with only an address', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('ap@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You are on the waitlist/)).toBeVisible()
    await expect(page.getByText(/^IC-[A-Z0-9]+-[A-Z0-9]{3}$/)).toBeVisible()
  })

  test('accepts a submission with a chosen workflow', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('ap@northwind-trading.example')
    await page
      .getByRole('combobox', { name: /first thing you would hand it/i })
      .selectOption('Payment runs and approvals')

    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You are on the waitlist/)).toBeVisible()
  })

  /**
   * Nothing sends a confirmation — `server/waitlist.ts` writes to a log — and
   * the first broken promise a pre-launch site makes is the expensive one.
   */
  test('does not promise a confirmation nobody sends', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('ap@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You are on the waitlist/)).toBeVisible()
    await expect(page.getByText(/check your inbox/i)).toHaveCount(0)
    await expect(page.getByText(/confirmation email/i)).toHaveCount(0)
  })

  test('is reachable and operable with the keyboard alone', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'No hardware keyboard on the phone project.')
    await ready(page)

    await emailField(page).focus()
    await page.keyboard.type('ap@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)

    // Tab past the optional select to the submit button, then activate it the
    // way a keyboard user does. Anything that traps focus in between fails here.
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(submit(page)).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.getByText(/You are on the waitlist/)).toBeVisible()
  })
})
