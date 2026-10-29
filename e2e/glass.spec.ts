import { statSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { cramped } from './support.ts'

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
  // Every scene after the film is drawn at its last frame: nothing waiting to rise, every change made.
  for (const scene of await page.locator('[data-scene]').all()) {
    await expect(scene).toHaveAttribute('data-scene', 'still')
  }
  const waiting = await page.evaluate(
    () =>
      [...document.querySelectorAll('[data-scene] [data-step], [data-scene] [data-pop]')].filter(
        (element) => getComputedStyle(element).opacity !== '1',
      ).length,
  )
  expect(waiting).toBe(0)
  for (const before of await page.locator('[data-swap="before"]').all()) {
    await expect(before).toHaveCSS('visibility', 'hidden')
  }
  for (const after of await page.locator('[data-swap="after"]').all()) {
    await expect(after).toHaveCSS('visibility', 'visible')
  }
  await expect(page.locator('.case-bar-part').first()).toHaveCSS('clip-path', 'none')
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
    'Your sellers spend more of the week on paperwork than with customers.',
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
  // Nothing is laid over the photograph: no caption, no card.
  await expect(morning.locator('.glass-handover, figcaption')).toHaveCount(0)
  const handover = page.locator('.glass-handover')
  // And what waits in the room is under it, not over it.
  const [photo, below] = await Promise.all([
    morning.boundingBox(),
    handover.boundingBox(),
  ])
  expect(below!.y).toBeGreaterThanOrEqual(photo!.y + photo!.height - 1)
  await expect(handover).toContainText('With a person · 08:04')
  await expect(handover.locator('.handover-message')).toContainText('#rfq-8841')
  await expect(handover.locator('.handover-message')).toContainText(
    '18 lines priced, 2 held',
  )
  await expect(handover.locator('.handover-decision .avatar')).toHaveAttribute(
    'src',
    '/people/james.svg',
  )
  // Sara, who the message is for, stands in her own mention.
  await expect(handover.locator('.handover-mention .avatar')).toHaveAttribute(
    'src',
    '/people/sara.svg',
  )
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
    await page
      .locator('.glass-stack')
      .evaluate((element: HTMLElement) =>
        element.style.getPropertyValue('--glass-drift'),
      ),
  ).toBe('')
})

test('the morning is a deck: two sheets step out behind the photograph, and the cards come out from under it', async ({
  page,
}) => {
  // Reduced motion is the last frame: the deck as it ends up.
  const morning = page.locator('.glass-morning')
  const stairs = morning.locator('.glass-stair')
  await expect(stairs).toHaveCount(2)
  for (const stair of await stairs.all()) await expect(stair).toHaveAttribute('aria-hidden', 'true')
  const [frame, near, far] = await Promise.all([
    morning.locator('.glass-morning-frame').boundingBox(),
    stairs.nth(0).boundingBox(),
    stairs.nth(1).boundingBox(),
  ])
  // Each sheet is a step higher and a step narrower than the one in front of it.
  expect(near!.y).toBeLessThan(frame!.y)
  expect(far!.y).toBeLessThan(near!.y)
  expect(near!.width).toBeLessThan(frame!.width)
  expect(far!.width).toBeLessThan(near!.width)
  // Nothing is written under reduced motion, and the cards are where they belong.
  const written = await page
    .locator('.glass-stack')
    .evaluate((element) =>
      ['--glass-drift', '--glass-rise', '--glass-deal'].map((name) =>
        (element as HTMLElement).style.getPropertyValue(name),
      ),
    )
  expect(written).toEqual(['', '', ''])
  // At rest nothing is moved: a transform that does nothing computes to none or to the identity.
  const still = (transform: string) =>
    transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
  for (const card of ['.handover-message', '.handover-decision', '.glass-deck']) {
    expect(
      still(await page.locator(card).evaluate((element) => getComputedStyle(element).transform)),
      card,
    ).toBe(true)
  }
})

test('the deck is dealt as the reader comes to it, and is whole once they have', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.keyboard.press('Shift')
  const stack = page.locator('.glass-stack')
  const read = () =>
    stack.evaluate((element) => {
      const style = (element as HTMLElement).style
      return {
        rise: Number(style.getPropertyValue('--glass-rise')),
        deal: Number(style.getPropertyValue('--glass-deal')),
      }
    })
  const placeAt = (fraction: number) =>
    page.evaluate((through) => {
      const frame = document.querySelector('.glass-morning-frame')!
      const top = frame.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top - window.innerHeight * through, behavior: 'instant' })
    }, fraction)

  // Far above it, the photograph has not come up and the cards are still under it.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect.poll(read).toEqual({ rise: 0, deal: 0 })
  // A little way up the screen, it is on its way.
  await placeAt(0.75)
  await expect.poll(async () => (await read()).rise).toBeGreaterThan(0.2)
  await expect.poll(async () => (await read()).rise).toBeLessThan(0.8)
  // Mid-screen, it is whole.
  await placeAt(0.3)
  await expect.poll(async () => (await read()).rise).toBe(1)
  // And the cards are dealt by the time they are what the reader is looking at.
  await stack.locator('.glass-handover').evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  )
  await expect.poll(async () => (await read()).deal).toBe(1)
})

test('the page ends on its name, set large and half in the light, with a way back up', async ({
  page,
}) => {
  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()
  const word = footer.locator('.glass-wordmark')
  // A drawing of the name the footer already carries as a link, so it is not announced twice.
  await expect(word).toHaveAttribute('aria-hidden', 'true')
  await expect(word).toHaveText('Incillum')
  // Ink and paper only, and one gradient each: a wash behind the footer and the fade on the word.
  const grounds = await footer.evaluate((element) => ({
    wash: getComputedStyle(element).backgroundImage,
    word: getComputedStyle(element.querySelector('.glass-wordmark span')!).backgroundImage,
  }))
  expect(grounds.wash).toContain('linear-gradient')
  expect(grounds.word).toContain('linear-gradient')
  expect(grounds.word).not.toMatch(/rgb\(\s*(\d+),\s*(?!\1)\d+,\s*\d+/)
  // It is cut off by the page, and never makes it wider.
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
  const box = (await word.boundingBox())!
  const page_ = await page.evaluate(() => ({
    bottom: document.documentElement.scrollHeight - window.scrollY,
    inner: window.innerHeight,
  }))
  expect(box.y + box.height).toBeLessThanOrEqual(page_.inner + 1)
  expect(page_.bottom).toBeGreaterThan(0)

  // The way back up goes to the top, and leaves the address as it was.
  const address = page.url()
  await footer.getByRole('link', { name: 'Back to top' }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  expect(page.url()).toBe(address)
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
  await expect(staticPage.locator('#trust .trust-commitment')).toHaveCount(6)
  await expect(staticPage.locator('#questions .questions-answer').first()).toBeVisible()
  await context.close()
})

test('trust: the boundary drawn as a system, the one way out a named person, and six commitments in plain words', async ({
  page,
}) => {
  const section = page.locator('#trust')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Nothing leaves without you.',
  )
  // One picture to a screen reader, described in full; the parts inside it are its drawing.
  const map = section.locator('.trust-map')
  await expect(map).toHaveAttribute('role', 'img')
  await expect(map).toHaveAttribute('aria-label', /only way out is a person’s approval/)

  // What comes in: a real email from a person, with its attachments, and a supplier's answer.
  const emails = map.locator('.trust-email')
  await expect(emails).toHaveCount(2)
  await expect(emails.first()).toContainText('Marta Keller')
  await expect(emails.first()).toContainText('RFQ 8841, framework agreement')
  await expect(emails.first().locator('.trust-attachment')).toHaveCount(2)
  await expect(emails.nth(1)).toContainText('Tomas Berg')
  await expect(emails.nth(1)).toContainText('Supplier confirmation SC-4471')

  // What stays: four of your own documents, and Charlie among them, behind the boundary.
  const boundary = map.locator('.trust-boundary')
  await expect(boundary).toContainText('Your organisation')
  await expect(boundary.locator('.trust-data')).toHaveText([
    /Price lists$/,
    /Costs$/,
    /Agreements$/,
    /Quotations$/,
  ])
  await expect(boundary.locator('.trust-charlie')).toContainText('Charlie')
  await expect(boundary.locator('.trust-guards li')).toHaveCount(3)

  // The path that does not exist, drawn and refused.
  await expect(map.locator('.trust-never')).toHaveText('Never')
  await expect(map.locator('.trust-training')).toHaveText('Model training')

  // The gate: a named person, no portrait (the owner's call), and the approval, small and one thing; then what goes out.
  const gate = map.locator('.trust-gate')
  await expect(gate).toContainText('James')
  await expect(gate).toContainText('Sales director')
  await expect(gate.locator('.avatar')).toHaveCount(0)
  await expect(gate.locator('.trust-approve-done')).toHaveText('Approved · 08:14')
  const button = await gate.locator('.trust-approve').boundingBox()
  expect(button!.height).toBeLessThan(40)
  expect(button!.height).toBeGreaterThan(24)
  await expect(map.locator('.trust-out')).toHaveCount(2)
  await expect(map.locator('.trust-chip[data-done]')).toHaveText(['Sent', 'Sent'])

  const commitments = section.locator('.trust-commitment')
  await expect(commitments).toHaveCount(6)
  for (const commitment of await commitments.all()) {
    await expect(commitment.locator('svg')).toBeAttached()
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
  // Every card stays inside the board, at every width.
  const outside = await map.evaluate((drawing) => {
    const box = drawing.getBoundingClientRect()
    return [
      ...drawing.querySelectorAll('.trust-email, .trust-boundary, .trust-gate, .trust-out'),
    ].filter((element) => {
      const rect = element.getBoundingClientRect()
      return rect.left < box.left - 1 || rect.right > box.right + 1
    }).length
  })
  expect(outside).toBe(0)
  // Nothing in a card touches its border: the last row sits above the card's own padding, at every width.
  expect(await cramped(map)).toEqual([])
  // And on a wide screen nothing on the board overlaps anything else that is text.
  const wide = await page.evaluate(() => window.matchMedia('(min-width: 80rem)').matches)
  if (wide) {
    const overlaps = await map.evaluate((drawing) => {
      const cards = [
        ...drawing.querySelectorAll('.trust-email, .trust-gate, .trust-out, .trust-boundary, .trust-training'),
      ].map((element) => element.getBoundingClientRect())
      let found = 0
      for (let a = 0; a < cards.length; a += 1) {
        for (let b = a + 1; b < cards.length; b += 1) {
          const [one, two] = [cards[a]!, cards[b]!]
          if (one.left < two.right - 1 && two.left < one.right - 1 && one.top < two.bottom - 1 && two.top < one.bottom - 1) found += 1
        }
      }
      return found
    })
    expect(overlaps).toBe(0)
  }
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
    const ground = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
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

test('questions are cards, each answered in full, with nothing folded away', async ({ page }) => {
  const section = page.locator('#questions')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('What you’ll want to know.')
  const cards = section.locator('.question-card')
  await expect(cards).toHaveCount(7)
  for (const card of await cards.all()) {
    await expect(card.locator('.question-tile svg')).toBeAttached()
    // The first sentence is the answer, set apart; the rest follows it.
    await expect(card.locator('.question-lead')).toHaveText(/[.?!]$/)
  }
  await expect(cards.nth(1).locator('.question-lead')).toHaveText('Not by itself.')
  await expect(section.locator('.questions-more a')).toHaveAttribute('href', '/contact')
  const answers = section.locator('.questions-answer')
  expect(await answers.count()).toBeGreaterThanOrEqual(5)
  for (const answer of await answers.all()) await expect(answer).toBeVisible()
  await expect(section.locator('details')).toHaveCount(0)
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
      // A bare `#` is the way back to the top, not a section.
      links.map((link) => link.getAttribute('href')!.split('#')[1]!).filter((id) => id !== ''),
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
  // This audit hydrates three routes in addition to the shared front-page setup.
  test.setTimeout(60_000)
  for (const [path, title] of [
    ['/', 'Incillum | Intelligence for commercial work'],
    ['/charlie', 'Charlie | Incillum'],
    ['/contact', 'Contact | Incillum'],
  ] as const) {
    await visit(page, path)
    await expect(page).toHaveTitle(title)
    const seen = await page.evaluate(() =>
      [
        document.body.innerText,
        ...[
          ...document.querySelectorAll('[alt], [aria-label], meta[name="description"]'),
        ].map(
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

test('the showcase: four scenes from one request, drawn from the example and clear at every width', async ({
  page,
}) => {
  const section = page.locator('#showcase')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Your quoting desk, without the queue.',
  )
  await expect(section.locator('.showcase-panel')).toHaveCount(4)
  await expect(section.getByRole('heading', { level: 3 })).toHaveText([
    'Picks it up the moment it lands',
    'Every figure, back to its page',
    'Your floor, held',
    'Nothing leaves without your yes',
  ])
  // The scenes are pictures to a screen reader: each panel's title and line say what they show.
  for (const art of await section.locator('.showcase-art').all()) {
    await expect(art).toHaveAttribute('aria-hidden', 'true')
  }

  // Pickup: the counts are the matrix's, the held lines its two.
  const pickup = section.locator('[data-panel="pickup"]')
  await expect(pickup.locator('.scene-steps li')).toHaveText([
    'Read the email and its 2 attachments',
    'Matched 20 lines to your catalogue',
    'Checked every price against its source',
    'Held 2 lines for a person',
  ])
  await expect(pickup.locator('.scene-result')).toHaveText('18 lines priced. 2 need your input.')
  await expect(pickup.locator('.scene-held li')).toHaveCount(2)
  // It is the one card that leads somewhere: a button that says so, stretched over the whole card.
  const meet = pickup.getByRole('link', { name: 'Meet Charlie' })
  await expect(meet).toHaveAttribute('href', '/charlie')
  await expect(meet).toBeVisible()
  await expect(section.locator('.showcase-panel a')).toHaveCount(1)
  await pickup.scrollIntoViewIfNeeded()
  const card = (await pickup.boundingBox())!
  const stretched = await pickup.evaluate((panel) => {
    const rect = panel.getBoundingClientRect()
    // A point in the picture, away from the button, is the link's.
    const hit = document.elementFromPoint(rect.left + rect.width * 0.7, rect.top + rect.height * 0.75)
    return hit?.closest('a')?.getAttribute('href') ?? null
  })
  expect(card.height).toBeGreaterThan(200)
  expect(stretched).toBe('/charlie')

  // Sources: six documents with their marks, and the agreed rate back to its clause.
  const sources = section.locator('[data-panel="sources"]')
  await expect(sources.locator('.scene-tiles li')).toHaveCount(6)
  await expect(sources.locator('.scene-tiles .file-icon')).toHaveCount(6)
  await expect(sources.locator('.scene-cited-row strong')).toHaveText('21.60')
  await expect(sources.locator('.scene-cited-source')).toContainText('Framework agreement, B.6')

  // Floor: line 14's margin, from the evidence document, under the floor, and the shortfall it names.
  const floor = section.locator('[data-panel="floor"]')
  await expect(floor.locator('.scene-floor-figure')).toHaveText('15.2%')
  await expect(floor.locator('.scene-short strong')).toHaveText('EUR 11,520.00')
  const positions = await floor.locator('.scene-track').evaluate((track) => {
    const { left, width } = track.getBoundingClientRect()
    return ['.scene-track-marker', '.scene-track-floor'].map((selector) => {
      const mark = track.querySelector(selector)!.getBoundingClientRect()
      return (mark.left + mark.width / 2 - left) / width
    })
  })
  expect(positions[0]).toBeCloseTo(15.2 / 25, 1)
  expect(positions[1]).toBeCloseTo(20 / 25, 1)

  // Approval: the channel's own request, approved by the person it names.
  const approval = section.locator('[data-panel="approval"]')
  await expect(approval.locator('.scene-ask-title')).toHaveText(
    'Request for quotation · Flanged housing, machined',
  )
  await expect(approval.locator('.scene-stamp')).toHaveText('Approved by James · 08:14')
  await expect(approval.locator('.scene-action-label')).toHaveText([
    'Supplier request',
    'Team update',
    'Call or meeting',
  ])

  // The people are portraits, and an email is drawn with Gmail's mark.
  await expect(section.locator('img')).toHaveCount(3)
  for (const image of await section.locator('img').all()) {
    await expect(image).toHaveClass(/avatar/)
    await expect(image).toHaveAttribute('src', /^\/people\/\w+\.svg$/)
  }
  await expect(section.locator('svg[data-kind="mail"]')).toHaveCount(4)
  // Every card stays inside its panel.
  const clipped = await section.locator('.showcase-panel').evaluateAll((panels) =>
    panels.flatMap((panel) => {
      const box = panel.getBoundingClientRect()
      return [
        ...panel.querySelectorAll(
          '.showcase-copy, .scene-mail, .scene-agent, .scene-cited, .scene-cause, .scene-short, .scene-ask, .scene-actions',
        ),
      ]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return rect.left < box.left - 1 || rect.right > box.right + 1 || rect.bottom > box.bottom + 1
        })
        .map((element) => element.className)
    }),
  )
  expect(clipped).toEqual([])
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('with motion, each scene waits at its first frame and plays once to its last as it comes into view', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.keyboard.press('Shift')

  const panel = page.locator('.showcase-panel[data-panel="approval"]')
  // Below the fold it is held at its first frame: the request still waiting for a yes.
  await expect(panel).toHaveAttribute('data-scene', 'armed')
  await expect(panel.locator('[data-swap="after"]').first()).toHaveCSS('visibility', 'hidden')

  await panel.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(panel).toHaveAttribute('data-scene', 'playing')
  // It ends where the still frame is: approved, and everything that waited on it sent.
  await expect(panel.locator('.scene-stamp')).toBeVisible({ timeout: 6000 })
  await expect(panel.locator('[data-swap="before"]').first()).toHaveCSS('visibility', 'hidden', {
    timeout: 6000,
  })

  // A figure counts to itself, and lands on exactly what is printed.
  const odds = page.locator('#odds')
  await odds.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(odds).toHaveAttribute('data-scene', 'playing')
  await expect(odds.locator('.case-stat-value [aria-hidden="true"]').first()).toHaveText('42h', {
    timeout: 6000,
  })

  // Once played it stays played: nothing replays on the way back.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(panel).toHaveAttribute('data-scene', 'playing')
})

test('the people are portraits, not initials, and an email carries the Gmail mark', async ({
  page,
}) => {
  const portraits = await page.locator('img.avatar').evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).getAttribute('src')),
  )
  // Every person has a face somewhere: James, Marta and Tomas in the showcase and the board, Sara in the morning.
  for (const person of ['james', 'sara', 'marta', 'tomas']) {
    expect(portraits, person).toContain(`/people/${person}.svg`)
  }
  // Nobody is a letter in a box.
  await expect(page.locator('.scene-avatar')).toHaveCount(0)
  // Every drawn email is Gmail's own mark, in its own colours, and the page never writes the name.
  const marks = page.locator('svg[data-kind="mail"]')
  expect(await marks.count()).toBeGreaterThanOrEqual(8)
  for (const mark of await marks.all()) {
    await expect(mark.locator('path[fill="#ea4335"]')).toHaveCount(1)
    await expect(mark.locator('path[fill="#4285f4"]')).toHaveCount(1)
  }
  await expect(page.locator('body')).not.toContainText(/gmail|google/i)
  // The portraits are real files, served.
  const response = await page.request.get('/people/james.svg')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('svg')
})

/** Relative luminance of an `rgb()` or `rgba()` colour: 0 is black, 1 is white. */
function luminance(color: string): number {
  const [red = 0, green = 0, blue = 0] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((part) => {
    const channel = Number(part) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/** What the masthead looks like right now: its brand, its button, and how much of a pane it is. */
async function readBar(page: Page) {
  return page.getByRole('banner').evaluate((bar) => {
    const brand = bar.querySelector('.site-brand')!
    const cta = bar.querySelector('.glass-bar-inner > nav > .desk-cta')!
    return {
      brand: getComputedStyle(brand).color,
      ctaFill: getComputedStyle(cta, '::before').backgroundColor,
      ctaText: getComputedStyle(cta).color,
      pane: Number(getComputedStyle(bar, '::before').opacity),
    }
  })
}

test('the navbar slides away going down and comes back the moment the reader scrolls up, with no progress line', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.keyboard.press('Shift')
  const banner = page.getByRole('banner')
  const top = async () => (await banner.boundingBox())?.y ?? 0
  await expect(banner).toHaveAttribute('data-tucked', 'false')

  // Going down it leaves, and is off the screen.
  await page.mouse.move(400, 400)
  for (let step = 0; step < 8; step += 1) {
    await page.mouse.wheel(0, 260)
    await page.waitForTimeout(60)
  }
  await expect(banner).toHaveAttribute('data-tucked', 'true')
  await expect.poll(top).toBeLessThan(-40)

  // One flick up and it is back.
  await page.mouse.wheel(0, -120)
  await expect(banner).toHaveAttribute('data-tucked', 'false')
  await expect.poll(async () => Math.abs(await top())).toBeLessThan(1)

  // Keyboard focus inside it brings it back, so no link is out of reach.
  for (let step = 0; step < 4; step += 1) {
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(60)
  }
  await expect(banner).toHaveAttribute('data-tucked', 'true')
  await banner.getByRole('link', { name: 'Request early access' }).focus()
  await expect(banner).toHaveAttribute('data-tucked', 'false')

  // At the very top it is always there; and nothing draws the reader's place along it.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect.poll(async () => Math.abs(await top())).toBeLessThan(1)
  expect(
    await banner.evaluate((element) => getComputedStyle(element, '::after').content),
  ).toBe('none')
})

test('under reduced motion the navbar never moves', async ({ page }) => {
  const banner = page.getByRole('banner')
  await page.mouse.move(400, 400)
  for (let step = 0; step < 8; step += 1) {
    await page.mouse.wheel(0, 260)
    await page.waitForTimeout(60)
  }
  await expect(banner).toHaveAttribute('data-tucked', 'false')
  expect(Math.abs((await banner.boundingBox())?.y ?? -99)).toBeLessThan(1)
})

test('the navbar can be read wherever the reader is put back, before the page’s own script has run', async ({
  page,
}) => {
  // Hold every script of the application back, so the page stays as the server drew it:
  // the top of the page, with the bar in the night's tokens. The head script is inline and still runs.
  // (A fresh document: the page the test opened with has long since hydrated.)
  await page.goto('about:blank')
  await page.route('**/*.js', (route) => route.abort())
  await page.goto('/#trust', { waitUntil: 'domcontentloaded' })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1500)

  const root = page.locator('html')
  await expect(root).not.toHaveAttribute('data-hydrated', 'true')
  // The head script has seen where the reader is: past the first screen, and past the night.
  await expect(root).toHaveAttribute('data-bar-pane', '')
  await expect(root).toHaveAttribute('data-bar-day', '')

  // So the bar is a white pane with dark ink and a dark button, not a pale bar over white paper.
  await expect
    .poll(async () => {
      const bar = await readBar(page)
      return {
        brand: luminance(bar.brand) < 0.1,
        pane: bar.pane,
        ctaFill: luminance(bar.ctaFill) < 0.1,
        ctaText: luminance(bar.ctaText) > 0.8,
      }
    })
    .toEqual({ brand: true, pane: 1, ctaFill: true, ctaText: true })
})

test('the navbar keeps those colours when the page takes over, and on a reload part-way down', async ({
  page,
}) => {
  await page.evaluate(() =>
    document.querySelector('#trust')?.scrollIntoView({ behavior: 'instant' }),
  )
  await reload(page)
  const banner = page.getByRole('banner')
  await expect(banner).toHaveAttribute('data-tone', 'day')
  await expect(page.locator('html')).toHaveAttribute('data-bar-live', '')
  await expect
    .poll(async () => {
      const bar = await readBar(page)
      return { brand: luminance(bar.brand) < 0.1, pane: bar.pane }
    })
    .toEqual({ brand: true, pane: 1 })

  // And back at the top it is clear, in the night's tokens.
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(banner).toHaveAttribute('data-tone', 'night')
  await expect.poll(async () => luminance((await readBar(page)).brand)).toBeGreaterThan(0.8)
})

test('without a script the navbar is a plain white pane, never a pale bar over white', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  })
  try {
    const page = await context.newPage()
    await page.route('**/*.mp4', (route) => route.abort())
    await page.goto(`${base}/#questions`, { waitUntil: 'domcontentloaded' })
    // With no script there is nothing to wait for but the stylesheet, which does not hold the document up.
    await expect
      .poll(async () => {
        const bar = await readBar(page)
        return [
          luminance(bar.brand) < 0.1,
          bar.pane === 1,
          luminance(bar.ctaFill) < 0.1,
          luminance(bar.ctaText) > 0.8,
        ]
      })
      .toEqual([true, true, true, true])
  } finally {
    await context.close()
  }
})

test('on a phone the Menu button opens one sheet with the Product page in it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const banner = page.getByRole('banner')
  const button = banner.locator('.phone-menu-button')
  const sheet = banner.locator('.phone-menu-sheet')

  // The desktop menus have no room, so the bar says so with a button, in words.
  await expect(button).toBeVisible()
  await expect(button).toHaveText('Menu')
  await expect(banner.locator('.site-menu-button')).toBeHidden()
  await expect(sheet).toBeHidden()
  // The button is still the bar's own, in its short form, and still named in full.
  await expect(banner.getByRole('link', { name: 'Request early access' })).toHaveText(
    'Early access',
    { useInnerText: true },
  )

  await button.click()
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('Product', { exact: true })).toBeVisible()
  await expect(sheet.getByRole('link', { name: /^Charlie/ })).toBeVisible()
  await expect(sheet.getByRole('link', { name: 'Contact' })).toBeVisible()
  await expect(sheet.getByRole('link', { name: 'Request early access' })).toBeVisible()
  // Under the sheet the bar is a pane, so the sheet is joined to it.
  expect((await readBar(page)).pane).toBe(1)

  // Escape closes it, and so does a tap anywhere else.
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await button.click()
  await expect(sheet).toBeVisible()
  await page.locator('body').dispatchEvent('pointerdown')
  await expect(sheet).toBeHidden()

  // Choosing Charlie goes to her page.
  await button.click()
  await sheet.getByRole('link', { name: /^Charlie/ }).click()
  await expect(page).toHaveURL(/\/charlie$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the masthead fits at every phone width: nothing in it runs past the gutter', async ({
  page,
}) => {
  for (const path of ['/', '/charlie']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('html[data-hydrated="true"]')
    for (const width of [320, 340, 360, 375, 390, 412, 430, 480, 600, 768]) {
      await page.setViewportSize({ width, height: 800 })
      const fit = await page.getByRole('banner').evaluate((bar) => {
        const items = [
          '.site-brand',
          '.glass-bar-inner > nav > .desk-cta',
          '.phone-menu-button',
          '.site-menu-button',
        ]
          .map((selector) => bar.querySelector(selector))
          .filter((element): element is Element => element !== null)
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width > 0)
        return {
          left: Math.min(...items.map((rect) => rect.left)),
          right: Math.max(...items.map((rect) => rect.right)),
          reach: window.innerWidth,
          // Whichever way into the menus there is, there is one.
          way:
            (bar.querySelector('.phone-menu-button')?.getBoundingClientRect().width ?? 0) +
            (bar.querySelector('.site-menu-button')?.getBoundingClientRect().width ?? 0),
        }
      })
      expect(fit.left, `${path} at ${width}: left`).toBeGreaterThanOrEqual(16)
      expect(fit.right, `${path} at ${width}: right`).toBeLessThanOrEqual(fit.reach - 16)
      expect(fit.way, `${path} at ${width}: a way to the menus`).toBeGreaterThan(0)
    }
  }
})

test('the phone menu works before the page has hydrated, and on a tablet', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.route('**/*.js', (route) => route.abort())
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const banner = page.getByRole('banner')
  await banner.locator('.phone-menu-button').click()
  await expect(banner.locator('.phone-menu-sheet')).toBeVisible()
  await expect(
    banner.locator('.phone-menu-sheet').getByRole('link', { name: /^Charlie/ }),
  ).toBeVisible()
})
