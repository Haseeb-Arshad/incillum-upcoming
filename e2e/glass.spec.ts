import { statSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The presentation, which is the front page (`/`).
 *
 * The rules under test are the home page's, carried onto a page that moves
 * more: the night's band and one dark panel, nothing else dark; the film opens
 * on one sentence, never a label; the money is the thread's; every other
 * figure is a third party's, with its source beside it; nothing is claimed,
 * nothing pulses, and the motto is not spent; one form, which is never
 * submitted here. And the presentation's own: no tracked capitals anywhere,
 * the opening gets out of the way, the film never starts by itself under
 * reduced motion and says in text everything it shows, the bar and the map
 * are drawn from their figures, and reduced motion gets the final frame of
 * all of it.
 *
 * Most tests read the page under reduced motion, which is its final frame and
 * the quickest way to the content. The ones about motion turn it back on.
 */
/** The front page. It was `/glass`, which now redirects here. */
const GLASS = '/'
const base =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? '3210'}`

async function visit(page: Page, path = GLASS) {
  // The preview does not implement byte ranges for the film. Waiting for every
  // media request to finish makes `load` depend on the whole video file.
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
}

async function reload(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/*.mp4', (route) => route.abort())
  await visit(page)
})

/**
 * Holds the opening for fifteen seconds a beat, from before the page is parsed.
 *
 * The real one is gone in just over five seconds, and a test has to wait for hydration
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
      // Above the stylesheet's own rule by specificity, so it wins wherever in the head it lands.
      style.textContent = ':root .glass { --glass-beat: 15s; }'
      document.head.append(style)
    }).observe(document, { childList: true, subtree: true })
  })
}

test('first screen: the headline, one form, the night and one dark panel, and no horizontal overflow', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Intelligence for commercial work.',
  )
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeAttached()
  await expect(page.locator('form')).toHaveCount(1)
  // The photograph and film make one continuous dark band; the case stays on paper.
  await expect(page.locator('[data-inverted]')).toHaveCount(1)
  await expect(page.locator('.glass-night[data-inverted]')).toHaveCount(1)
  await expect(page.locator('a[href="#film"]')).toBeVisible()
  await expect(page.locator('#film')).toHaveCount(1)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('the film opens on one sentence, and says in text everything it shows', async ({
  page,
}) => {
  const film = page.locator('#film')
  // What it follows is the block's first line and its name: a sentence, not a label.
  await expect(film.getByRole('heading', { level: 2 })).toHaveText(
    /^One request for quotation/,
  )
  await expect(film).toHaveAccessibleName(/^One request for quotation/)
  const video = film.locator('video.reel-video')
  await expect(video).toHaveAttribute('src', '/film/incillum.mp4')
  await expect(video).toHaveAttribute('poster', '/film/incillum.webp')
  // Its statements, in order, for whoever does not play it; the outward one waits for an approval.
  const statements = film.locator('#film-statements li')
  await expect(statements).toHaveCount(10)
  await expect(statements.first()).toHaveText('Every order starts with a quotation.')
  await expect(statements.nth(5)).toHaveText(/^With your approval/)
})

test('under reduced motion the film never starts by itself', async ({ page }) => {
  const film = page.locator('#film')
  const video = film.locator('video.reel-video')
  await video.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true)
  await expect(film.getByRole('button', { name: 'Play the film' }).first()).toBeVisible()
})

test('the film and its poster are there to serve', async ({ request }) => {
  // The poster over the wire, the film from disk: the preview server ignores byte ranges and
  // compresses a whole video before it answers, which takes longer than a test may wait.
  const poster = await request.get('/film/incillum.webp')
  expect(poster.ok()).toBe(true)
  expect(
    statSync(new URL('../public/film/incillum.mp4', import.meta.url)).size,
  ).toBeGreaterThan(1_000_000)
})

test('the opening ends on its own, and leaves nothing over the page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await visit(page)

  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'ended', {
    timeout: 14_000,
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
  await visit(page)
  const opening = page.locator('.glass-opening')

  await expect(opening).toBeVisible()
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'playing')
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')
  await expect(opening).toBeHidden()
  // At once: the entrance restarts under its no-delay name instead of waiting out the opening.
  // Asserted on the mechanism, not on an opacity sampled mid-frame.
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'animation-name',
    'glass-enter-now',
  )
})

test('the opening plays once a visit: not on a return from another page, and again on a reload', async ({
  page,
}) => {
  // Three page loads, each waited out to hydration.
  test.slow()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await visit(page)
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'playing')
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')

  // Back from another page, the page is simply there: marked before the first paint, and kept so.
  await visit(page, '/charlie')
  await page.locator('.site-brand').first().click()
  await page.waitForURL(/\/$/)
  await expect(page.locator('html')).toHaveAttribute('data-opened', '')
  await page.waitForSelector('html[data-hydrated="true"]')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'seen')
  await expect(page.locator('.glass-opening')).toBeHidden()
  const title = page.getByRole('heading', { level: 1 })
  await expect(title).toHaveCSS('animation-name', 'none')
  await expect(title).toHaveCSS('opacity', '1')
  await expect(page.locator('.glass-field[data-tone="night"]')).toHaveAttribute(
    'data-formed',
    'true',
  )

  // A reload plays it again.
  await reload(page)
  expect(await page.locator('html').getAttribute('data-opened')).toBeNull()
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'playing')
  await expect(page.locator('.glass-opening')).toBeVisible()
})

test('a reload below the first screen keeps the reader’s place, with nothing over it', async ({
  page,
}) => {
  // Four page loads, each waited out to hydration.
  test.slow()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await visit(page)
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')

  await page
    .locator('#questions')
    .evaluate((element) =>
      element.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
  await reload(page)
  await expect(page.locator('html')).toHaveAttribute('data-opened', '')
  await expect(page.locator('.glass-opening')).toBeHidden()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // At the top, a reload plays it as before.
  await page.evaluate(() => window.scrollTo(0, 0))
  await reload(page)
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'playing')
})

test('an address that names a section opens on it, with nothing over it', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  // A new document, not the fragment navigation a hash on the open front page would be.
  await page.goto('about:blank')
  await visit(page, `${GLASS}#questions`)
  await expect(page.locator('html')).toHaveAttribute('data-opened', '')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'seen')
  await expect(page.locator('.glass-opening')).toBeHidden()
})

test('the opening introduces the work and Charlie in three beats, and the dust keeps time', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await visit(page)
  const opening = page.locator('.glass-opening')
  const beats = opening.locator('p')
  await expect(beats).toHaveText([
    'Intelligence should move work forward.',
    'From request to decision.',
    'Meet Charlie.',
  ])
  // One statement at a time; the remaining beats wait their turn.
  await expect(beats.nth(0)).toHaveCSS('opacity', '1')
  await expect(beats.nth(1)).toHaveCSS('opacity', '0')
  await expect(beats.nth(2)).toHaveCSS('opacity', '0')
  for (const beat of await beats.all()) {
    const fits = await beat.evaluate((element) => {
      const box = element.getBoundingClientRect()
      return (
        box.left >= 0 &&
        box.right <= innerWidth &&
        box.top >= 0 &&
        box.bottom <= innerHeight
      )
    })
    expect(fits).toBe(true)
  }
  // Set a word at a time, and only by what the browser moves off the main thread, so hydrating under it cannot stall it.
  await expect(beats.nth(0).locator(':scope > span')).toHaveCount(5)
  const moved = await opening.evaluate((element) => [
    ...new Set(
      element
        .getAnimations({ subtree: true })
        .flatMap((animation) => (animation.effect as KeyframeEffect).getKeyframes())
        .flatMap((frame) => Object.keys(frame))
        .filter(
          (key) => !['offset', 'computedOffset', 'easing', 'composite'].includes(key),
        ),
    ),
  ])
  expect(moved.sort()).toEqual(['opacity', 'transform', 'visibility'])
  // Fifteen seconds a beat: well inside the first, the night is still dark — it comes up only as the page assembles.
  await expect(page.locator('.glass-field[data-tone="night"]')).toHaveAttribute(
    'data-formed',
    'false',
  )
  await page.screenshot({ path: testInfo.outputPath('opening.png') })
})

test('nothing is claimed, nothing pulses, and the signal stays where it is licensed', async ({
  page,
}) => {
  const copyWithoutCitations = await page.evaluate(() => {
    const copy = document.body.cloneNode(true) as HTMLElement
    copy.querySelectorAll('.case-sources').forEach((source) => source.remove())
    return copy.innerText
  })
  expect(copyWithoutCitations).not.toMatch(
    /trusted by|customers include|testimonial|SOC 2|ISO 27001|HIPAA|GDPR|check your inbox|NetSuite|\bSAP\b|Salesforce|Gmail|Outlook|�/i,
  )
  // A publisher is named only as the source under its own figure: the week's survey.
  await expect(page.locator('.case-week .case-sources')).toContainText(
    'Salesforce, State of Sales, 2025 survey',
  )
  // The front page's close carries the motto once, as its last line.
  const text = await page.locator('body').innerText()
  expect(text.match(/stay with the work/gi)).toHaveLength(1)
  await expect(page.getByRole('contentinfo')).toContainText('Stay with the work.')

  const infinite = await page.evaluate(
    () =>
      [...document.querySelectorAll('*')].filter(
        (element) => getComputedStyle(element).animationIterationCount === 'infinite',
      ).length,
  )
  expect(infinite).toBe(0)

  // The licensed text is the reader's own hour and the floor shortfall. Held states and their shortfall remain inside the product film.
  const strays = await page.evaluate(() => {
    const signal = new Set(['rgb(154, 85, 24)', 'rgb(228, 160, 70)'])
    const licensed =
      'section[aria-label="A day, drawn to scale"] .text-signal, .glass-handover-short'
    return [...document.querySelectorAll('body *')]
      .filter((element) => element.childElementCount === 0 && element.textContent?.trim())
      .filter((element) => signal.has(getComputedStyle(element).color))
      .filter((element) => !element.closest(licensed))
      .map((element) => element.textContent?.trim())
  })
  expect(strays).toEqual([])
})

test('no tracked capitals: no label over a heading, and none inside the documents', async ({
  page,
}) => {
  const capitals = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((element) => element.childElementCount === 0 && element.textContent?.trim())
      .filter((element) => getComputedStyle(element).textTransform === 'uppercase')
      .map((element) => element.textContent?.trim()),
  )
  expect(capitals).toEqual([])
})

test('reduced motion renders the final frame', async ({ page }) => {
  await expect(page.locator('.glass-opening')).toBeHidden()
  for (const selector of [
    '.glass-bar',
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
  await expect(page.locator('.case-week-figure .case-bar')).toHaveCSS('clip-path', 'none')
  await expect(page.locator('.case-week-figure .case-bar')).toHaveCSS(
    'transition-duration',
    '0s',
  )
})

test('the sourced case: its figures, citations and week bar follow the research', async ({
  page,
}) => {
  const odds = page.locator('#odds')
  await expect(odds.getByRole('heading', { level: 2 })).toHaveText(
    'A slow quote costs you twice.',
  )
  await expect(odds.locator('.case-stat')).toHaveCount(4)
  await expect(odds.locator('.case-stat-value')).toHaveText(['42h', '7×', '23%', '8%'])
  await expect(odds.locator('.case-sources a')).toHaveText([
    'Harvard Business Review, 2011',
    'McKinsey Quarterly, 2003',
  ])
  await expect(odds.getByRole('img')).toHaveAttribute(
    'aria-label',
    'The Americas, Europe and Africa, drawn in dots.',
  )
  await expect(odds.locator('.case-map path')).toHaveAttribute('d', /^M/)
  await expect(odds.locator('.case-note')).toContainText('Charlie picks up every request')

  const week = page.locator('.case-week')
  await expect(week.getByRole('heading', { level: 2 })).toHaveText(
    'More of a sales week goes on quotes and data entry than on customers.',
  )
  await expect(week.locator('.case-sources a')).toHaveText(
    'Salesforce, State of Sales, 2025 survey',
  )
  const runs = await week.locator('.case-bar-part').evaluateAll((elements) =>
    elements.map((element) => ({
      share: element.querySelector('.case-bar-share')?.textContent,
      width: element.getBoundingClientRect().width,
    })),
  )
  expect(runs.map((run) => run.share)).toEqual(['22%', '30%', '48%'])
  const widths = runs.map((run) => run.width)
  const total = widths.reduce((sum, width) => sum + width, 0)
  expect(widths[0]! / total).toBeCloseTo(0.22, 2)
  expect(widths[1]! / total).toBeCloseTo(0.3, 2)
  expect(widths[2]! / total).toBeCloseTo(0.48, 2)
  await expect(week.locator('.case-bar')).toHaveAttribute(
    'aria-label',
    'A sales rep’s working week: with customers 22%, quotes and data entry 30%, everything else 48%.',
  )
})

test('the dust holds one still frame under reduced motion, and drifts without it', async ({
  page,
}) => {
  for (const tone of ['night', 'morning']) {
    const field = page.locator(`.glass-field[data-tone="${tone}"]`)
    await expect(field, tone).toHaveAttribute('data-ready', 'true')
    await expect(field, tone).toHaveAttribute('data-motion', 'still')
    expect(
      await field.evaluate((element: HTMLElement) => element.style.transform),
      tone,
    ).toBe('')
  }
  // Reduced motion gets the landscape formed, never its opening.
  await expect(page.locator('.glass-field[data-tone="night"]')).toHaveAttribute(
    'data-formed',
    'true',
  )

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const night = page.locator('.glass-field[data-tone="night"]')
  await expect(night).toHaveAttribute('data-motion', 'flowing')
  const first = await night.screenshot()
  await expect
    .poll(async () => Buffer.compare(first, await night.screenshot()) !== 0, {
      timeout: 15_000,
    })
    .toBe(true)

  // Scrolled past, it fades out and stops drawing rather than running behind the film.
  await page
    .locator('#film .reel-frame')
    .evaluate((element) =>
      element.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
  await expect(night).toHaveAttribute('data-motion', 'still')
})

test('the night stays dark under the beats, and comes up once the opening is over', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await visit(page)
  const night = page.locator('.glass-field[data-tone="night"]')
  await expect(night).toHaveAttribute('data-ready', 'true')
  await expect(night).toHaveAttribute('data-formed', 'false')
  // Ending the opening early brings the night up at once rather than waiting out the beats.
  await page.keyboard.press('Shift')
  await expect(page.locator('.glass')).toHaveAttribute('data-opening', 'skipped')
  await expect(night).toHaveAttribute('data-formed', 'true', { timeout: 15_000 })
})

test('the morning is the same room, and what waits in it is the night’s own', async ({
  page,
}) => {
  const morning = page.locator('.glass-morning')
  await expect(morning.getByRole('img')).toHaveAttribute('alt', /08:04/)
  const handover = morning.locator('.glass-handover')
  await expect(handover).toContainText('With a person · 08:04')
  await expect(handover).toContainText(
    'Quote under the floor, or go back on the lead time.',
  )
  await expect(handover).toContainText('Neither happens without you.')
  for (const figure of ['16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(handover).toContainText(figure)
  }
  await expect(handover.locator('.glass-handover-short')).toContainText('EUR 10,638.00')
  // Reduced motion: the photograph holds still, centred.
  expect(
    await morning
      .locator('.glass-morning-frame')
      .evaluate((element: HTMLElement) =>
        element.style.getPropertyValue('--glass-drift'),
      ),
  ).toBe('')
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

test('server HTML carries the headline, the form, the film’s statements and its sentence', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.route('**/*.mp4', (route) => route.abort())
  await staticPage.goto(`${base}${GLASS}`, { waitUntil: 'domcontentloaded' })
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeAttached()
  await expect(staticPage.locator('#film h2')).toHaveText(/^One request for quotation/)
  await expect(staticPage.locator('#film-statements li')).toHaveCount(10)
  await expect(staticPage.locator('#film video')).toHaveAttribute(
    'poster',
    '/film/incillum.webp',
  )
  // Without a script the figures, citations, map and bar are all present.
  await expect(staticPage.locator('#odds .case-stat-value')).toHaveText([
    '42h',
    '7×',
    '23%',
    '8%',
  ])
  await expect(staticPage.locator('#odds .case-map svg')).toBeVisible()
  await expect(staticPage.locator('.case-week .case-bar-share')).toHaveText([
    '22%',
    '30%',
    '48%',
  ])
  await expect(staticPage.locator('.case-sources a').first()).toBeVisible()
  await expect(staticPage.locator('#trust .trust-rule')).toHaveCount(6)
  await expect(staticPage.locator('#questions .questions-answer').first()).toBeVisible()
  await context.close()
})

test('trust: six commitments as ruled rows, no state labels, and no certification named', async ({
  page,
}) => {
  const section = page.locator('#trust')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Your numbers stay yours.',
  )
  const rules = section.locator('.trust-rule')
  await expect(rules).toHaveCount(6)
  for (const rule of await rules.all()) {
    await expect(rule.locator('dt svg')).toBeAttached()
    await expect(rule.locator('dd')).toBeVisible()
  }
  // The approval boundary keeps its words, wherever it is set.
  await expect(section).toContainText(
    'No quotation, request or document is sent, and no price committed, until a person approves it.',
  )
  await expect(section).not.toContainText(/Decided|In build|Planned|Not held/)
  // The build's own progress is kept for the owner, off the page.
  await expect(page.locator('body')).not.toContainText(
    /SOC 2|ISO\/IEC|GDPR|CCPA|HIPAA|certified|compliant|Honest about what exists/,
  )
})

test('nothing on the page paints over the masthead, from the top to the footer', async ({
  page,
}) => {
  // Every point across the masthead's middle, at every scroll position, belongs to the masthead.
  const covered = await page.evaluate(() => {
    const banner = document.querySelector('[role="banner"]')!
    const box = banner.getBoundingClientRect()
    const y = box.top + box.height / 2
    const found: string[] = []
    const end = document.documentElement.scrollHeight - window.innerHeight
    for (let top = 0; top <= end; top += 120) {
      window.scrollTo({ top, behavior: 'instant' })
      for (let x = 4; x < window.innerWidth; x += 48) {
        const hit = document.elementFromPoint(x, y)
        if (hit && !banner.contains(hit)) found.push(`${top}px, x ${x}: ${hit.className}`)
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    return found.slice(0, 5)
  })
  expect(covered).toEqual([])
})

test('after the night the page lies on white paper, with nothing grained into it', async ({
  page,
}) => {
  for (const selector of ['body', '.glass-acts']) {
    const ground = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return { colour: style.backgroundColor, image: style.backgroundImage }
      })
    expect(ground, selector).toEqual({ colour: 'rgb(255, 255, 255)', image: 'none' })
  }
  // The sections on the desk paint no ground of their own: the white is the desk's, under them.
  for (const selector of ['.case-week', '.trust', '.questions']) {
    const ground = await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element)
      return { colour: style.backgroundColor, image: style.backgroundImage }
    })
    expect(ground, selector).toEqual({ colour: 'rgba(0, 0, 0, 0)', image: 'none' })
  }
  const oddsGround = await page.locator('.case-odds').evaluate((element) => {
    const style = getComputedStyle(element)
    return { colour: style.backgroundColor, image: style.backgroundImage }
  })
  expect(oddsGround).toEqual({ colour: 'rgb(242, 242, 240)', image: 'none' })
})

test('questions are answered in full, with nothing folded away', async ({ page }) => {
  const section = page.locator('#questions')
  const answers = section.locator('.questions-answer')
  expect(await answers.count()).toBeGreaterThanOrEqual(5)
  for (const answer of await answers.all()) await expect(answer).toBeVisible()
  await expect(page.locator('details')).toHaveCount(0)
  await expect(section.locator('[hidden]')).toHaveCount(0)
})

test('the masthead stays with the reader, and its links land somewhere real', async ({
  page,
}) => {
  const banner = page.getByRole('banner')
  await expect(banner).toHaveAttribute('data-scrolled', 'false')
  // In the night's tokens over the night, and the paper's over the paper: never a dark bar over white.
  await expect(banner).toHaveAttribute('data-tone', 'night')
  await page
    .locator('#trust')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(banner).toHaveAttribute('data-scrolled', 'true')
  await expect(banner).toHaveAttribute('data-tone', 'day')
  expect((await banner.boundingBox())?.y).toBe(0)
  await expect(
    banner.getByRole('link', { name: 'Request early access' }),
  ).toBeInViewport()

  // Every link to a section of this page, written `#id` or `/#id`, names one that exists, once.
  const anchors = await page
    .locator('a[href^="#"], a[href^="/#"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')!.split('#')[1]!),
    )
  for (const id of new Set(anchors)) {
    await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1)
  }

  // The button puts the cursor in the field.
  await banner.getByRole('link', { name: 'Request early access' }).click()
  await expect(page.getByRole('textbox', { name: /^Work email/ })).toBeFocused()
})

test('is the front page: indexable, canonical at the root, and where /glass now lands', async ({
  page,
  request,
}) => {
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/)
  await expect(page).toHaveTitle(/intelligence for commercial work/i)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain('/glass')

  // The old address is a permanent redirect, not a second copy of the page.
  const moved = await request.get('/glass', { maxRedirects: 0 })
  expect(moved.status()).toBe(301)
  expect(new URL(moved.headers()['location'] ?? '', 'http://x').pathname).toBe('/')
  await page.goto('/glass', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('a[href="/glass"]')).toHaveCount(0)
})

test('no em dash anywhere a reader sees, and every title uses a straight line', async ({
  page,
}) => {
  for (const [path, title] of [
    ['/', 'Incillum | Intelligence for commercial work'],
    ['/charlie', 'Charlie | Incillum'],
    ['/contact', 'Contact | Incillum'],
  ] as const) {
    await page.goto(path)
    await page.waitForSelector('html[data-hydrated="true"]')
    await expect(page).toHaveTitle(title)
    const seen = await page.evaluate(() =>
      [
        document.body.innerText,
        ...[...document.querySelectorAll('[alt], [aria-label], meta[name="description"]')].map(
          (element) =>
            element.getAttribute('alt') ??
            element.getAttribute('aria-label') ??
            element.getAttribute('content') ??
            '',
        ),
      ].join('\n'),
    )
    expect(seen.match(/[^\n]*—[^\n]*/g) ?? [], path).toEqual([])
  }
})

test('the showcase: four panels, each a title and a line over a drawing of the example quotation', async ({
  page,
}) => {
  const section = page.locator('#showcase')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Your quoting desk, without the queue.',
  )
  await expect(section.locator('.showcase-panel')).toHaveCount(4)
  await expect(section.getByRole('heading', { level: 3 })).toHaveText([
    'Reads whatever arrives',
    'Figures without a source',
    'Holds your margin',
    'Read, price, approve',
  ])
  // The drawings are pictures to a screen reader: each panel's title and line say what they show.
  for (const art of await section.locator('.showcase-art').all()) {
    await expect(art).toHaveAttribute('aria-hidden', 'true')
  }
  // The dial reads the 06:50 ledger, and the held lines are the matrix's two.
  await expect(section.locator('.showcase-readings dd')).toHaveText(['16.4%', '20.0%'])
  await expect(section.locator('.showcase-sheet li[data-status="held"]')).toHaveCount(2)
  await expect(section.locator('.showcase-approve')).toContainText('Approve and send')
  // Nobody else's mark: the one image in it is Incillum's own.
  await expect(section.locator('img')).toHaveCount(1)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})
