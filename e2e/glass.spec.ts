import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The presentation at /glass.
 *
 * The rules under test are the home page's, carried onto a page that moves
 * more: one dark region; the invented material says so first; the money is the
 * thread's; nothing is claimed, nothing pulses, and the motto is not spent; one
 * form, which is never submitted here. And the presentation's own: the opening
 * gets out of the way, the film plays once and stops at 08:04, the reader can
 * pause it, the sources gather and come apart with the scroll, and reduced
 * motion gets the final frame of all of it.
 *
 * Most tests read the page under reduced motion, which is its final frame and
 * the quickest way to the content. The ones about motion turn it back on.
 */
const GLASS = '/glass'
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3210'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
})

/**
 * Holds the opening for fifteen seconds a beat, from before the page is parsed.
 *
 * The real one is gone in under four, and a test has to wait for hydration
 * before any key it presses can end it — which, with four workers sharing a
 * machine, is sometimes longer than that. Without this, a test of skipping it
 * is a test of how busy the machine was.
 */
async function holdTheOpening(page: Page) {
  await page.addInitScript(() => {
    new MutationObserver((_, observer) => {
      if (!document.head) return
      observer.disconnect()
      const style = document.createElement('style')
      style.textContent = '.glass { --glass-beat: 15s; }'
      document.head.append(style)
    }).observe(document, { childList: true, subtree: true })
  })
}

/** With motion on: reload, end the opening with a key, and bring the film on screen. */
async function watchTheFilm(page: Page, frame: string) {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.addStyleTag({ content: `.glass { --glass-frame: ${frame}; }` })
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')
  // Not `scrollIntoViewIfNeeded`: the film already peeks into the first screen, which counts as
  // in view for that and not for the film, which waits until nearly half of it is showing.
  await page
    .locator('.glass-film')
    .evaluate((element) =>
      element.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
}

test('first screen: the headline, one form, one dark region, and no horizontal overflow', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Intelligence for commercial work.',
  )
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeAttached()
  await expect(page.locator('form')).toHaveCount(1)
  await expect(page.locator('[data-inverted]')).toHaveCount(1)
  await expect(page.locator('a[href="#film"]')).toBeVisible()
  await expect(page.locator('#film')).toHaveCount(1)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('the film says it is invented first, and its chapters are the thread’s hours', async ({
  page,
}) => {
  const film = page.locator('#film')
  await expect(film.getByRole('heading', { level: 2 })).toHaveText(/^Illustrative/)
  await expect(film.locator('.glass-film-lede')).toContainText(/invented/i)

  const chapters = film
    .getByRole('group', { name: 'Hours of the night' })
    .getByRole('button')
  await expect(chapters).toHaveCount(6)
  for (const [index, hour] of [
    '23:47',
    '00:06',
    '01:18',
    '03:42',
    '06:50',
    '08:04',
  ].entries()) {
    await expect(chapters.nth(index)).toHaveAccessibleName(new RegExp(`^${hour}`))
  }

  // Reduced motion: nothing to play, six chapters to step through.
  await expect(film.getByRole('button', { name: /play|pause|again/i })).toHaveCount(0)

  await chapters.nth(2).click()
  await expect(film.locator('.glass-beat[data-active="true"]')).toContainText('01:18')
  await expect(film.locator('.glass-sheet-row[data-status="held"]')).toHaveCount(2)

  await chapters.nth(3).press('Enter')
  await expect(film.locator('.glass-beat[data-active="true"]')).toContainText('03:42')
  await expect(film.locator('.glass-sheet-row[data-status="changed"]')).toHaveCount(1)
})

test('the film’s money is the thread’s money', async ({ page }) => {
  const film = page.locator('#film')
  await film.getByRole('button', { name: /^06:50/ }).click()
  for (const figure of ['EUR 236,400.00', '16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(film.locator('.glass-sheet-ledger')).toContainText(figure)
  }
  await expect(film.locator('.glass-sheet-row[data-status="priced"]')).toHaveCount(4)
})

test('the film plays once, in order, and stops at 08:04', async ({ page }) => {
  await watchTheFilm(page, '400ms')
  const film = page.locator('.glass-film')
  const seen: string[] = []
  await expect
    .poll(
      async () => {
        const stage = (await film.getAttribute('data-stage')) ?? ''
        if (seen.at(-1) !== stage) seen.push(stage)
        return stage
      },
      { intervals: [100], timeout: 10_000 },
    )
    .toBe('5')
  expect(seen).toEqual(['0', '1', '2', '3', '4', '5'])
  await expect(page.getByRole('button', { name: 'Watch it again' })).toBeVisible()
  await page.waitForTimeout(1200)
  await expect(film).toHaveAttribute('data-stage', '5')

  await page.getByRole('button', { name: 'Watch it again' }).click()
  await expect(film).toHaveAttribute('data-stage', '0')
})

test('the reader can pause the film, and it holds where it was', async ({ page }) => {
  await watchTheFilm(page, '1500ms')
  const film = page.locator('.glass-film')
  await expect(film).toHaveAttribute('data-running', 'true')
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(film).toHaveAttribute('data-running', 'false')
  const held = await film.getAttribute('data-stage')
  await page.waitForTimeout(2200)
  await expect(film).toHaveAttribute('data-stage', held!)
  await expect(page.getByRole('button', { name: 'Play the night' })).toBeVisible()
})

test('the opening ends on its own, and leaves nothing over the page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')

  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'ended', {
    timeout: 8_000,
  })
  await expect(page.locator('.glass-opening')).toBeHidden()
  // Nothing transparent left on top: the middle of the screen is the page's own.
  const onTop = await page.evaluate(() =>
    document
      .elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      ?.closest('.glass-opening'),
  )
  expect(onTop).toBeNull()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1')
})

test('any key ends the opening early, and the page arrives at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  const opening = page.locator('.glass-opening')

  await expect(opening).toBeVisible()
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'playing')
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')
  await expect(opening).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1')
})

test('six sources gather into one thread as the reader scrolls, and come apart again', async ({
  page,
}, testInfo) => {
  const sources = page.locator('.glass-sources')
  await expect(sources.getByRole('heading', { level: 2 }).first()).toHaveText(
    'Six sources that never meet.',
  )
  await expect(sources.locator('.glass-piece')).toHaveCount(6)
  await expect(sources.locator('.glass-thread-row')).toHaveCount(6)
  // The thread holds the matrix's two lines, in the one colour, and nothing else does.
  await expect(sources.locator('.glass-thread .matrix-status--held')).toHaveCount(2)

  const top = await sources.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  )
  const height = await sources.evaluate(
    (element) => (element as HTMLElement).offsetHeight,
  )
  await page.evaluate((y) => window.scrollTo(0, y), top)
  await expect(sources).toHaveAttribute('data-phase', 'scattered')
  await page.evaluate((y) => window.scrollTo(0, y), top + height * 0.6)
  await expect(sources).toHaveAttribute('data-phase', 'gathered')
  await page.evaluate((y) => window.scrollTo(0, y), top)
  await expect(sources).toHaveAttribute('data-phase', 'scattered')

  // A phone cannot hold the stage, so it reads the two pictures downwards instead of pinning.
  const position = await sources
    .locator('.glass-sources-stage')
    .evaluate((element) => getComputedStyle(element).position)
  expect(position).toBe(testInfo.project.name === 'mobile' ? 'static' : 'sticky')
})

test('nothing is claimed, nothing pulses, and the signal stays where it is licensed', async ({
  page,
}) => {
  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers include|testimonial|SOC 2|ISO 27001|HIPAA|GDPR|check your inbox|NetSuite|\bSAP\b|Salesforce|Gmail|Outlook|�/i,
  )
  const text = await page.locator('body').innerText()
  expect(text.match(/stay with the work/gi)).toBeNull()

  const infinite = await page.evaluate(
    () =>
      [...document.querySelectorAll('*')].filter(
        (element) => getComputedStyle(element).animationIterationCount === 'infinite',
      ).length,
  )
  expect(infinite).toBe(0)

  // The one hue is set on held lines and on the figure that breaks the floor. Anything else in it is a fifth use.
  const strays = await page.evaluate(() => {
    const signal = new Set(['rgb(154, 85, 24)', 'rgb(228, 160, 70)'])
    const licensed =
      '.matrix-status--held, .glass-sheet-short, .glass-thread-short, .glass-day-held, .glass-day-short'
    return [...document.querySelectorAll('body *')]
      .filter((element) => element.childElementCount === 0 && element.textContent?.trim())
      .filter((element) => signal.has(getComputedStyle(element).color))
      .filter((element) => !element.closest(licensed))
      .map((element) => element.textContent?.trim())
  })
  expect(strays).toEqual([])
})

test('reduced motion renders the final frame', async ({ page }) => {
  await expect(page.locator('.glass-opening')).toBeHidden()
  for (const selector of [
    '.glass-header',
    '.glass-title',
    '.glass-form',
    '.glass-film-enter',
  ]) {
    const style = await page.locator(selector).evaluate((element) => {
      const computed = getComputedStyle(element)
      return { opacity: computed.opacity, animation: computed.animationName }
    })
    expect(style, selector).toEqual({ opacity: '1', animation: 'none' })
  }
  expect(
    await page
      .locator('.glass-piece')
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toMatch(/^0s/)
})

test('the inline field keeps its name and validates, and nothing is sent', async ({
  page,
}) => {
  let posted = false
  await page.route('**/_serverFn/**', (route) => {
    if (route.request().method() === 'POST') posted = true
    return route.abort()
  })
  const email = page.getByRole('textbox', { name: /^Work email/ })
  await page.getByRole('button', { name: 'Request early access' }).click()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await email.fill('person@gmail.com')
  await email.press('Tab')
  await expect(page.getByText(/Use your work email/)).toBeVisible()
  expect(posted).toBe(false)
})

test('server HTML carries the headline, the form, the whole night and the licence', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto(`${base}${GLASS}`)
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeAttached()
  await expect(staticPage.locator('#film h2')).toHaveText(/^Illustrative/)
  await expect(staticPage.locator('.glass-beat')).toHaveCount(6)
  for (const hour of ['23:47', '00:06', '01:18', '03:42', '06:50', '08:04']) {
    await expect(staticPage.locator('.glass-beat', { hasText: hour })).toBeVisible()
  }
  await expect(staticPage.getByText('Six sources that never meet.')).toBeVisible()
  await expect(staticPage.getByText('One thread, every source attached.')).toBeVisible()
  await context.close()
})

test('stays off the spine: noindex, unlisted, and linked from nowhere public', async ({
  page,
  request,
}) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/glass$/)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain(GLASS)
  await page.goto('/')
  await expect(page.locator(`a[href="${GLASS}"]`)).toHaveCount(0)
})
