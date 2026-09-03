import { expect, test } from '@playwright/test'

import type { Browser, Page } from '@playwright/test'

/**
 * The site, end to end.
 *
 * Four things are covered, and only one of them is the form.
 *
 * The **page** half checks what would break silently: the landmarks, the skip
 * link, the absence of a product navigation this site is not supposed to have,
 * and the claims it is not allowed to make.
 *
 * The **night** half covers the one design decision the whole page turns on —
 * that the band inverts and the sections inside it are in the right order — and
 * the one value the server cannot produce, which is the reader's clock. The
 * clock tests are pinned to a fixed instant so an assertion does not depend on
 * when the suite runs.
 *
 * The **arithmetic** half checks that the illustrative figures reach a browser
 * intact. `content/site.test.ts` proves they reconcile; this proves they are
 * rendered rather than only stored.
 *
 * The **form** half exercises the real server function: validation on both
 * sides, the progressive disclosure, the accessible error wiring, and the
 * success state. Fields are queried by role and accessible name rather than
 * `getByLabel`, which matches ARIA labelling generally rather than only
 * `<label for>` associations and can be won by an unrelated landmark elsewhere
 * on the page.
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

/**
 * The hero's form. There are two on the page — see `components/early-access.tsx`
 * — and every form assertion below drives the first one, so a failure names one
 * instance rather than an ambiguous locator.
 */
function emailField(page: Page) {
  return page.getByRole('textbox', { name: /^Work email/ }).first()
}

function submit(page: Page) {
  return page.getByRole('button', { name: /Join early access/ }).first()
}

test.describe('the page', () => {
  test('leads with the argument and carries its landmarks', async ({ page }) => {
    await ready(page)

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /The work doesn’t leave when you do/,
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
   * One ask. A "book a demo" beside "join early access" is the change that
   * arrives when somebody reasonable decides the page should capture both kinds
   * of interest, and it is how a pre-launch page stops converting either.
   */
  test('asks for one thing', async ({ page }) => {
    await ready(page)

    const body = (await page.locator('body').innerText()).toLowerCase()
    for (const competing of ['book a demo', 'request a demo', 'see it in action', 'start free']) {
      expect(body).not.toContain(competing)
    }
  })

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
    for (const forbidden of [
      'trusted by',
      'customers love',
      'fully autonomous',
      'revolutionary',
      'soc 2',
      'iso 27001',
    ]) {
      expect(body).not.toContain(forbidden)
    }
  })

  /**
   * The claim this page is most likely to acquire by accident. Reading a
   * mailbox is a thing software does; contacting somebody's suppliers on their
   * behalf is a different promise, and it is not made here.
   */
  test('never claims to contact a supplier', async ({ page }) => {
    await ready(page)
    const body = (await page.locator('body').innerText()).toLowerCase()

    for (const forbidden of [
      'asks the supplier',
      'chases the supplier',
      'contacts the supplier',
      'emails the supplier',
    ]) {
      expect(body).not.toContain(forbidden)
    }
  })

  /**
   * The motto survives on scarcity. Twice on the page is a signature; a third
   * placement makes it a slogan, and a slogan is a thing readers skip.
   *
   * One of the two is inside the success state, which is not on the page until
   * somebody submits — so before submission there is exactly one.
   */
  test('prints the motto once, before anybody joins', async ({ page }) => {
    await ready(page)
    const occurrences = (
      await page.locator('body').innerText()
    ).toLowerCase().split('stay with the work').length - 1
    expect(occurrences).toBe(1)
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

  /**
   * The night plate is several hundred vectors of skyline placed by a seeded
   * generator at module scope. If that ever became `Math.random()`, the server
   * and the browser would draw different cities — React would warn on every
   * load and, on a bad day, throw away the server's markup. A hydration
   * mismatch surfaces as a console error, which this catches.
   */
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

  /**
   * Two forms on one page is the pattern that usually ships with duplicate ids,
   * and the failure is silent: the second instance's `<label for>` resolves to
   * the first instance's input, so clicking a label at the foot of the page
   * focuses a field eight screens up. It is also an axe violation.
   */
  test('renders two forms with no id collisions', async ({ page }) => {
    await ready(page)

    await expect(page.locator('form')).toHaveCount(2)

    const report = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)
      return {
        duplicates: ids.filter((id, index) => ids.indexOf(id) !== index),
        labelsResolve: [...document.querySelectorAll('label[for]')].every((label) =>
          Boolean(document.getElementById((label as HTMLLabelElement).htmlFor)),
        ),
      }
    })

    expect(report.duplicates).toEqual([])
    expect(report.labelsResolve).toBe(true)
  })
})

test.describe('the night', () => {
  /**
   * The page goes dark where the office empties and comes back to paper where a
   * person returns. It is one inverted region containing three sections, and
   * "one" is the load-bearing part — a second `data-inverted` anywhere turns a
   * time of day into an accent colour.
   */
  test('is one inverted band, holding the plate, the instrument and the thread', async ({
    page,
  }) => {
    await ready(page)

    const band = page.locator('[data-inverted]')
    await expect(band).toHaveCount(1)

    // Everything the night is made of is inside it, and the boundary section —
    // the first thing after the page returns to paper — is not.
    await expect(band.locator('#night-heading')).toHaveCount(1)
    await expect(band.locator('#thread-heading')).toHaveCount(1)
    await expect(band.locator('figure')).toHaveCount(1)
    await expect(band.locator('#boundary-heading')).toHaveCount(0)

    // And it is genuinely dark, rather than merely marked.
    const background = await band.evaluate((node) => getComputedStyle(node).backgroundColor)
    expect(background).toBe('rgb(19, 19, 18)')
  })

  /**
   * The plate is `aria-hidden` because a screen reader announcing four hundred
   * rectangles is noise. That is only acceptable while the description beside
   * it is real text.
   */
  test('describes its one image in words', async ({ page }) => {
    await ready(page)

    await expect(page.getByText(/The office is empty/)).toBeVisible()
    await expect(page.locator('figure svg[aria-hidden="true"]')).toHaveCount(1)

    const html = await page.locator('figcaption').innerText()
    expect(html).toMatch(/commercial office at night/i)
  })

  test('runs the thread from 23:47 to 08:04, in order', async ({ page }) => {
    await ready(page)

    const hours = await page
      .locator('section[aria-labelledby="thread-heading"] ol > li p')
      .filter({ hasText: /^\d{2}:\d{2}$/ })
      .allInnerTexts()

    expect(hours).toEqual(['23:47', '00:06', '01:18', '03:42', '06:50', '08:04'])
  })

  /**
   * The thread and the evidence document are the same quotation at two
   * magnifications, and `content/site.test.ts` proves the figures reconcile.
   * This proves they reach a browser: a number that only exists in a unit test
   * is a number nobody sees.
   */
  test('renders the figures that have to reconcile', async ({ page }) => {
    await ready(page)

    for (const figure of ['EUR 236,400.00', '16.4%', '20.0%', 'EUR 10,638.00']) {
      await expect(page.getByText(figure, { exact: false }).first()).toBeVisible()
    }

    for (const figure of ['EUR 162,816.00', 'EUR 192,000.00', 'EUR 29,184.00', 'EUR 11,520.00']) {
      await expect(page.getByText(figure, { exact: false }).first()).toBeVisible()
    }
  })

  /**
   * Both illustrative blocks say what they are in their own first lines, at
   * reading size, in the server's HTML — not in small print underneath. That
   * sentence is the whole licence for material this specific, and it is the
   * first thing somebody trims when a section feels long.
   */
  test('labels its illustrative material, in the server’s HTML', async ({ page, request }) => {
    await ready(page)

    await expect(page.getByText(/Invented, and marked as invented/)).toBeVisible()
    await expect(page.getByText(/Invented, and not a screenshot/)).toBeVisible()

    const html = await (await request.get('/')).text()
    expect(html).toContain('Invented, and marked as invented')
    expect(html).toContain('Invented, and not a screenshot')
    expect(html).toContain('Illustrative')
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
      night.page.getByText(/Fifteen of these twenty-four hours have nobody attached/),
    ).toBeVisible()
    await night.context.close()

    const afternoon = await pageAt(browser, '2026-01-14T16:28:00Z')
    await expect(
      afternoon.page.getByText(/Fifteen of these twenty-four hours have nobody attached/),
    ).toBeVisible()
    await expect(afternoon.page.getByText(/It is\s*16:28\s*where you are/)).toBeVisible()

    // The claim that used to sit here in the middle of the afternoon.
    const body = await afternoon.page.locator('body').innerText()
    expect(body).not.toContain('at their desks')
    await afternoon.context.close()
  })

  /**
   * The mark is the reader's own hour and nothing more. A verb attached to it
   * — "working now", a counter, a pulse — would be a claim made simultaneously
   * to every visitor about work nobody is doing for them.
   */
  test('never says anything is happening at that hour', async ({ browser }) => {
    const { context, page } = await pageAt(browser, '2026-01-14T03:20:00Z')

    const body = (await page.locator('body').innerText()).toLowerCase()
    for (const forbidden of ['working now', 'active now', 'running now', 'live now']) {
      expect(body).not.toContain(forbidden)
    }

    await context.close()
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
    expect(html).toContain('Most workdays end')
    expect(html).toContain('Staffed')
    expect(html).toContain('Fifteen of these twenty-four hours have nobody attached to the work')
  })
})

test.describe('the waitlist form', () => {
  test('blocks an empty submission and marks the field invalid', async ({ page }) => {
    await ready(page)

    await submit(page).click()

    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText(/You’re on the list/)).toHaveCount(0)
  })

  test('rejects a personal address with an explanation', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('someone@gmail.com')
    await emailField(page).blur()

    await expect(page.getByText(/work email address/i).first()).toBeVisible()
  })

  test('clears the error once the address is corrected', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('someone@gmail.com')
    await emailField(page).blur()
    await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true')

    await emailField(page).fill('director@northwind-trading.example')
    await expect(emailField(page)).not.toHaveAttribute('aria-invalid', 'true')
  })

  /**
   * The progressive disclosure, and the fault it exists to avoid.
   *
   * An earlier build revealed these fields automatically once the address had
   * been blurred and was valid. Clicking the submit button *is* a blur, so
   * somebody who typed an address and went straight for the button had five
   * fields inserted above it at the instant they pressed — the button slid down
   * and the click landed on nothing. Four tests in this file caught it, which is
   * the reason the two below are worth their runtime.
   *
   * Nothing moves unless the reader asks. This asserts both halves: the
   * questions are absent until the summary is opened, and opening it is what
   * puts them on the page.
   */
  test('keeps the qualifying questions behind a disclosure', async ({ page }) => {
    await ready(page)

    await expect(page.getByRole('textbox', { name: /^Company/ })).toHaveCount(0)

    // Typing and blurring a valid address moves nothing.
    await emailField(page).fill('director@northwind-trading.example')
    await emailField(page).blur()
    await expect(page.getByRole('textbox', { name: /^Company/ })).toHaveCount(0)

    await page.getByText(/Tell us about the work/).first().click()

    await expect(page.getByRole('textbox', { name: /^Company/ }).first()).toBeVisible()
    await expect(page.getByRole('combobox', { name: /RFQs or quotes/ }).first()).toBeVisible()
    await expect(page.getByRole('textbox', { name: /costs you the most/ }).first()).toBeVisible()
  })

  /**
   * The specific regression, kept as its own test because it is the one that
   * cost a submission: type, wait, click, and the click has to land.
   */
  test('submits on the first click for somebody who never opens the disclosure', async ({
    page,
  }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
  })

  /**
   * Every question but the address is optional, and "make this one required" is
   * the single most likely well-meaning change anybody will make to this form.
   * This is the test that fails when they do.
   */
  test('accepts a submission with only an address', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
    await expect(page.getByText(/^IC-[A-Z0-9]+-[A-Z0-9]{3}$/)).toBeVisible()
  })

  test('accepts a fully answered submission', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page
      .getByRole('combobox', { name: /kind of commercial work/i })
      .first()
      .selectOption('Industrial distribution')

    await page.getByText(/Tell us about the work/).first().click()
    await page.getByRole('textbox', { name: /^Company/ }).first().fill('Northwind Trading')
    await page.getByRole('textbox', { name: /^Your role/ }).first().fill('Commercial Director')
    await page
      .getByRole('combobox', { name: /RFQs or quotes/ })
      .first()
      .selectOption('200 to 1,000 a month')
    await page.getByRole('textbox', { name: /^Current ERP/ }).first().fill('Infor M3')
    await page
      .getByRole('textbox', { name: /costs you the most/ })
      .first()
      .fill('Matching customer part numbers to our catalogue.')

    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
  })

  /**
   * Nothing sends a confirmation — `server/waitlist.ts` mails us — and the
   * first broken promise a pre-launch site makes is the expensive one.
   */
  test('does not promise a confirmation nobody sends', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
    await expect(page.getByText(/check your inbox/i)).toHaveCount(0)
    await expect(page.getByText(/confirmation email/i)).toHaveCount(0)
  })

  /** The second of the motto's two placements, and the last thing a joiner reads. */
  test('closes the success state on the motto', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/Until then: stay with the work/)).toBeVisible()
  })

  /**
   * Submitting one form must not resolve the other. The success state is a
   * receipt for an action, not a status for the page — and the two instances
   * sharing state would mean a reader who joined at the top finds their own
   * receipt waiting eight screens down, addressed to nobody.
   */
  test('leaves the second form untouched when the first is submitted', async ({ page }) => {
    await ready(page)

    await emailField(page).fill('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)
    await submit(page).click()

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
    await expect(page.getByRole('textbox', { name: /^Work email/ })).toHaveCount(1)
  })

  test('is reachable and operable with the keyboard alone', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'No hardware keyboard on the phone project.')
    await ready(page)

    await emailField(page).focus()
    await page.keyboard.type('director@northwind-trading.example')
    await page.waitForTimeout(PAST_SPAM_GATE_MS)

    /**
     * Address, the one visible select, the disclosure summary, the button.
     *
     * A keyboard user reaching submit in three presses — rather than stepping
     * through six questions they did not ask for — is the point of the
     * disclosure being closed, and anything that traps focus in between fails
     * here.
     */
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('combobox', { name: /kind of commercial work/i }).first(),
    ).toBeFocused()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(submit(page)).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.getByText(/You’re on the list/)).toBeVisible()
  })

  /**
   * The summary has to be operable the way a native disclosure is. A div with an
   * `onClick` looks identical, passes a mouse-driven test, and is unreachable
   * from a keyboard — which is how this pattern usually ships broken.
   */
  test('opens the disclosure from the keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'No hardware keyboard on the phone project.')
    await ready(page)

    await emailField(page).focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('textbox', { name: /^Company/ }).first()).toBeVisible()
  })
})
