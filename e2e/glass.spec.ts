import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The presentation, which is the front page (`/`).
 *
 * The rules under test are the home page's, carried onto a page that moves
 * more: one dark region; the invented material says so first, in a sentence;
 * the money is the thread's; nothing is claimed, nothing pulses, and the motto
 * is not spent; one form, which is never submitted here. And the
 * presentation's own: no tracked capitals anywhere, the opening gets out of the
 * way, the film plays once and stops at 08:04, the reader can pause it, the
 * documents gather and come apart with the scroll, nothing lies under the
 * photographed part, and reduced motion gets the final frame of all of it.
 *
 * Most tests read the page under reduced motion, which is its final frame and
 * the quickest way to the content. The ones about motion turn it back on.
 */
/** The front page. It was `/glass`, which now redirects here. */
const GLASS = '/'
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
  // The licence is the frame's first line and its name: a sentence, not a label.
  await expect(film.getByRole('heading', { level: 2 })).toHaveText(/invented/i)
  await expect(film).toHaveAccessibleName(/invented/i)

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
  await expect(film.locator('.glass-namebox')).toHaveText('F5, F12')

  await chapters.nth(3).press('Enter')
  await expect(film.locator('.glass-beat[data-active="true"]')).toContainText('03:42')
  await expect(film.locator('.glass-sheet-row[data-status="changed"]')).toHaveCount(1)
  await expect(film.locator('.glass-namebox')).toHaveText('E15')
  // The cost the supplier moved, struck through above the one that replaced it, in the cell selected.
  const moved = film.locator('.glass-sheet-row[data-status="changed"] [data-column="rate"]')
  await expect(moved).toHaveAttribute('data-selected', 'true')
  await expect(moved.locator('s')).toHaveText('128.00')
  await expect(moved).toContainText('135.68')
  // And both fit the cell. A cell clips what it cannot hold, and once cut the new cost mid-figure.
  // Measured on the figures, not on `scrollWidth`, which also counts the fill handle.
  const spill = await moved.evaluate((cell) => {
    const box = cell.getBoundingClientRect()
    const value = cell.querySelector('.glass-cell-value')!.getBoundingClientRect()
    return Math.max(
      box.left - value.left,
      value.right - box.right,
      box.top - value.top,
      value.bottom - box.bottom,
    )
  })
  expect(spill).toBeLessThanOrEqual(0)
})

test('the sheet is a spreadsheet: empty while the request is a PDF, then every rate a document’s', async ({
  page,
}) => {
  const film = page.locator('#film')
  const cells = film.locator('.glass-sheet-row td:not(.glass-grid-index)')

  await film.getByRole('button', { name: /^23:47/ }).click()
  await expect(film.locator('.glass-namebox')).toHaveText('A1')
  expect((await cells.allTextContents()).join('').trim()).toBe('')

  await film.getByRole('button', { name: /^00:06/ }).click()
  await expect(film.locator('.glass-namebox')).toHaveText('A2:F21')
  // All six columns are the sheet's; a narrow sheet hides some, as a spreadsheet hides columns.
  expect(await film.locator('.glass-grid-head th').allTextContents()).toEqual([
    'Line',
    'Item',
    'Category',
    'Qty',
    'Rate',
    'Status',
  ])
  await expect(film.getByRole('columnheader', { name: 'Item' })).toBeVisible()
  await expect(film.getByRole('columnheader', { name: 'Rate' })).toBeVisible()
  const rates = film.locator('.glass-sheet-row [data-column="rate"]')
  await expect(rates).toHaveText(['21.60', '18.40', '—', '3.15', '6.90', '—', '128.00'])

  await film.getByRole('button', { name: /^08:04/ }).click()
  await expect(film.locator('.glass-namebox')).toHaveText('Quote')
  await expect(film.locator('.glass-sheet')).toHaveAttribute('data-range', 'all')
})

test('every pill on the sheet is whole, at every hour and every width', async ({
  page,
}) => {
  const film = page.locator('#film')
  const pills = film.locator('.glass-sheet-row .matrix-status')
  // 23:47 has none: the request is still a PDF.
  for (const hour of ['00:06', '01:18', '03:42', '06:50', '08:04']) {
    await film.getByRole('button', { name: new RegExp(`^${hour}`) }).click()
    await expect(film.locator('.glass-beat[data-active="true"]')).toContainText(hour)
    await expect(pills).toHaveCount(await film.locator('.glass-sheet-row').count())
    // Measured against the cell's content box, not its edge: a cell cuts a pill off at its
    // padding, and trails an ellipsis after one that is over its content by any amount.
    // And against the sheet, which cuts off whatever its last column cannot hold.
    const spills = await pills.evaluateAll((elements) =>
      elements
        .map((pill) => {
          const cell = pill.closest('td')!
          const sheet = pill.closest('.glass-sheet')!
          const box = cell.getBoundingClientRect()
          const style = getComputedStyle(cell)
          const value = pill.getBoundingClientRect()
          const edge =
            sheet.getBoundingClientRect().left + sheet.clientLeft + sheet.clientWidth
          const spill = Math.max(
            box.left + parseFloat(style.paddingLeft) - value.left,
            value.right - (box.right - parseFloat(style.paddingRight)),
            value.right - edge,
            box.top - value.top,
            value.bottom - box.bottom,
          )
          return { pill: pill.textContent, spill }
        })
        .filter(({ spill }) => spill > 0),
    )
    expect(spills, hour).toEqual([])
  }

  // The room is not taken from the item: where it wraps, on a phone, no word of it is cut.
  const cut = await film
    .locator('.glass-sheet-row [data-column="item"]')
    .evaluateAll((cells) =>
      cells
        .filter((cell) => getComputedStyle(cell).whiteSpace !== 'nowrap')
        .filter((cell) => cell.scrollWidth > cell.clientWidth)
        .map((cell) => cell.textContent),
    )
  expect(cut).toEqual([])
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
})

test('the film’s money is the thread’s money', async ({ page }) => {
  const film = page.locator('#film')
  await film.getByRole('button', { name: /^06:50/ }).click()
  for (const figure of ['EUR 236,400.00', '16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(film.locator('.glass-sheet-ledger')).toContainText(figure)
  }
  await expect(film.locator('.glass-sheet-row[data-status="priced"]')).toHaveCount(4)
})

test('the film plays in order, holds the morning, and goes round again', async ({ page }) => {
  // Six hours of animation-timed playback and round again: on a loaded machine a
  // headless browser draws frames slowly enough to need more than the default budget.
  test.slow()
  await watchTheFilm(page, '400ms')
  const film = page.locator('.glass-film')
  const seen: string[] = []
  let wrapped = false
  await expect
    .poll(
      async () => {
        const stage = (await film.getAttribute('data-stage')) ?? ''
        if (seen.at(-1) !== stage) seen.push(stage)
        // Once the morning has been reached, the next hour is 23:47 again.
        wrapped = seen.includes('5') && seen.at(-1) === '0'
        return wrapped
      },
      { intervals: [100], timeout: 15_000 },
    )
    .toBe(true)
  expect(seen).toEqual(['0', '1', '2', '3', '4', '5', '0'])
  // It keeps playing: the reader is offered a pause, not a replay.
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
})

test('the reader can pause the film, and it holds where it was', async ({ page }) => {
  await watchTheFilm(page, '1500ms')
  const film = page.locator('.glass-film')
  await expect(film).toHaveAttribute('data-running', 'true')
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
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
  // At once: the entrance restarts under its no-delay name instead of waiting out the opening.
  // Asserted on the mechanism, not on an opacity sampled mid-frame.
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'animation-name',
    'glass-enter-now',
  )
})

test('six sources gather into one thread as the reader scrolls, and come apart again', async ({
  page,
}, testInfo) => {
  const sources = page.locator('.glass-sources')
  await expect(sources.getByRole('heading', { level: 2 }).first()).toHaveText(
    'Six sources that never meet.',
  )
  // Six documents and the part itself on the desk; six rows on the sheet, each with its document.
  await expect(sources.locator('.glass-piece .gd')).toHaveCount(6)
  await expect(sources.locator('.glass-piece[data-kind="part"] img')).toHaveCount(1)
  await expect(sources.locator('.glass-thread-row')).toHaveCount(6)
  await expect(sources.locator('.glass-thread-row .glass-thumb .gd')).toHaveCount(6)
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

  // The one hue is set on held lines and on the figure that breaks the floor. Anything else in it is a fifth use.
  const strays = await page.evaluate(() => {
    const signal = new Set(['rgb(154, 85, 24)', 'rgb(228, 160, 70)'])
    const licensed =
      '.matrix-status--held, .glass-sheet-short, .glass-thread-short, .glass-handover-short, .how-card-short, .how-decide-short, .cf-held, .cf-short'
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

test('the documents carry their own contents, and the part lies on bare desk', async ({
  page,
}) => {
  const desk = page.locator('.glass-desk-figure')
  // Real contents, from the same quotation: the empty revision, the moving cost, the floor clause.
  await expect(desk.locator('.gd-drawing')).toContainText('Rev —')
  await expect(desk.locator('.gd-grid tr[data-moving]')).toContainText('128.00')
  await expect(desk.locator('.gd-changes')).toContainText('135.68')
  await expect(desk.locator('.gd-clauses li[data-floor]')).toContainText('20.0%')
  // The agreed rates the sheet reads for the two lines priced from the agreement.
  await expect(desk.locator('.gd-clauses')).toContainText('BR-6061 21.60')
  await expect(desk.locator('.gd-clauses')).toContainText('GS-12 3.15')
  await expect(desk.locator('.gd-question')).toHaveCount(6)

  // `multiply` shows whatever is under the photograph through the metal, so nothing may be.
  await desk.scrollIntoViewIfNeeded()
  const crossings = await page.evaluate(() => {
    for (const piece of document.querySelectorAll<HTMLElement>('.glass-piece')) {
      piece.style.setProperty('--turn-wide', '0')
      piece.style.setProperty('--turn-narrow', '0')
    }
    const box = (element: Element) => element.getBoundingClientRect()
    const meets = (
      a: DOMRect,
      b: { left: number; right: number; top: number; bottom: number },
    ) =>
      !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)
    const part = box(document.querySelector('.glass-piece[data-kind="part"]')!)
    const inset = part.width * 0.2
    const metal = {
      left: part.left + inset,
      right: part.right - inset,
      top: part.top + inset,
      bottom: part.bottom - inset,
    }
    const found: string[] = []
    for (const document_ of document.querySelectorAll('.glass-piece .gd, .gd-question')) {
      if (meets(box(document_), metal)) found.push(document_.className)
    }
    const tangle = [...document.querySelectorAll<SVGSVGElement>('.glass-tangle')].find(
      (svg) => getComputedStyle(svg).display !== 'none',
    )!
    for (const path of tangle.querySelectorAll('path')) {
      const length = path.getTotalLength()
      const matrix = path.getScreenCTM()!
      for (let step = 0; step <= 60; step += 1) {
        const point = path.getPointAtLength((length * step) / 60)
        const x = matrix.a * point.x + matrix.c * point.y + matrix.e
        const y = matrix.b * point.x + matrix.d * point.y + matrix.f
        if (x > metal.left && x < metal.right && y > metal.top && y < metal.bottom) {
          found.push(path.getAttribute('d') ?? 'path')
          break
        }
      }
    }
    return found
  })
  expect(crossings).toEqual([])
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
  expect(
    await page
      .locator('.glass-piece')
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toMatch(/^0s/)
})

test('the dust holds one still frame under reduced motion, and drifts without it', async ({
  page,
}) => {
  for (const tone of ['night', 'morning']) {
    const field = page.locator(`.glass-field[data-tone="${tone}"]`)
    await expect(field, tone).toHaveAttribute('data-ready', 'true')
    await expect(field, tone).toHaveAttribute('data-motion', 'still')
    expect(await field.evaluate((element: HTMLElement) => element.style.transform), tone).toBe('')
  }
  // Reduced motion gets the landscape formed, never its opening.
  await expect(page.locator('.glass-field[data-tone="night"]')).toHaveAttribute('data-formed', 'true')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const night = page.locator('.glass-field[data-tone="night"]')
  await expect(night).toHaveAttribute('data-motion', 'flowing')
  const first = await night.screenshot()
  await expect
    .poll(async () => Buffer.compare(first, await night.screenshot()) !== 0, { timeout: 15_000 })
    .toBe(true)

  // Scrolled past, it fades out and stops drawing rather than running behind the film.
  await page.locator('.glass-film').evaluate((element) =>
    element.scrollIntoView({ block: 'start', behavior: 'instant' }),
  )
  await expect(night).toHaveAttribute('data-motion', 'still')
})

test('the landscape opens from a slit of light, and forms by the end of the opening', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await holdTheOpening(page)
  await page.goto(GLASS)
  const night = page.locator('.glass-field[data-tone="night"]')
  await expect(night).toHaveAttribute('data-ready', 'true')
  await expect(night).toHaveAttribute('data-formed', 'false')
  // Skipping the opening finishes the formation at once rather than leaving it half drawn.
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
  await expect(handover).toContainText('Quote under the floor, or go back on the lead time.')
  await expect(handover).toContainText('Neither happens without you.')
  for (const figure of ['16.4%', '20.0%', 'EUR 10,638.00']) {
    await expect(handover).toContainText(figure)
  }
  await expect(handover.locator('.glass-handover-short')).toContainText('EUR 10,638.00')
  // Reduced motion: the photograph holds still, centred.
  expect(
    await morning
      .locator('.glass-morning-frame')
      .evaluate((element: HTMLElement) => element.style.getPropertyValue('--glass-drift')),
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

test('server HTML carries the headline, the form, the whole night and the licence', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  await staticPage.goto(`${base}${GLASS}`)
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(staticPage.getByRole('textbox', { name: /^Work email/ })).toBeAttached()
  await expect(staticPage.locator('#film h2')).toHaveText(/invented/i)
  await expect(staticPage.locator('.glass-beat')).toHaveCount(6)
  for (const hour of ['23:47', '00:06', '01:18', '03:42', '06:50', '08:04']) {
    await expect(staticPage.locator('.glass-beat', { hasText: hour })).toBeVisible()
  }
  await expect(staticPage.getByText('Six sources that never meet.')).toBeVisible()
  await expect(staticPage.getByText('Now they meet.')).toBeVisible()
  await expect(staticPage.getByText(/The six on this page are invented/)).toBeVisible()
  // Without a script the four steps are simply listed, each with its heading.
  await expect(staticPage.locator('#how .how-panel-heading')).toHaveCount(4)
  for (const panel of await staticPage.locator('#how .how-panel').all()) {
    await expect(panel).toBeVisible()
  }
  await expect(staticPage.locator('#trust .trust-cell')).toHaveCount(6)
  await expect(staticPage.locator('#questions .questions-answer').first()).toBeVisible()
  await context.close()
})

test('where the stage pins, the scroll walks the four steps, and a tab scrolls to its step', async ({
  page,
}) => {
  const track = page.locator('.how-track')
  const fits = await page.evaluate(
    () => window.matchMedia('(min-width: 48rem) and (min-height: 46rem)').matches,
  )
  // The attribute follows hydration by one render, so wait for it rather than read it once.
  await expect(track).toHaveAttribute('data-pinned', fits ? 'true' : 'false')
  test.skip(!fits, 'pins only where the whole stage fits on one screen')

  const tabs = page.locator('#how').getByRole('tab')
  const scrollTo = (fraction: number) =>
    track.evaluate((element, f) => {
      const top = element.getBoundingClientRect().top + window.scrollY
      const height = element.getBoundingClientRect().height
      window.scrollTo(0, top + f * (height - window.innerHeight))
    }, fraction)
  for (const [fraction, index] of [
    [0.1, 0],
    [0.35, 1],
    [0.6, 2],
    [0.9, 3],
  ] as const) {
    await scrollTo(fraction)
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true')
  }
  // The stage holds still under the masthead while the track passes.
  const stage = await page.locator('.how-stage').boundingBox()
  const bar = await page.getByRole('banner').boundingBox()
  expect(Math.abs((stage?.y ?? 0) - (bar?.height ?? 0))).toBeLessThan(2)

  // Choosing a tab scrolls to its step, and the scroll keeps it chosen.
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await page.waitForTimeout(1200)
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
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
    // Wait for the panel to be drawn before reading it: `innerText` of a panel not yet shown is empty.
    const limit = panel.locator('.how-stops-line strong')
    await expect(limit).toHaveText(/\S/)
    limits.push((await limit.innerText()).replace(/\.$/, ''))
  }
  expect([...limits].sort()).toEqual(['Ambiguity', 'Approval', 'Commercial policy', 'Missing evidence'])
})

test('the tabs’ figures are the evidence document’s and the ledger’s, and a change is a swap', async ({
  page,
}) => {
  const section = page.locator('#how')
  await section.getByRole('tab', { name: /Hold/ }).click()
  await expect(section.getByRole('tabpanel').locator('.matrix-status--held')).toHaveCount(2)

  await section.getByRole('tab', { name: /Price/ }).click()
  const price = section.getByRole('tabpanel')
  for (const figure of ['20.0%', '15.2%', 'EUR 160.00', 'EUR 11,520.00']) {
    await expect(price).toContainText(figure)
  }
  // Under reduced motion nothing fades: nothing longer than the site's 0.01ms backstop.
  const durations = await price.evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(',').map((value) => parseFloat(value)),
  )
  for (const seconds of durations) expect(seconds).toBeLessThan(0.001)

  await section.getByRole('tab', { name: /Decide/ }).click()
  const decide = section.getByRole('tabpanel')
  for (const figure of ['EUR 169.60', '16.4%', 'EUR 10,638.00']) {
    await expect(decide).toContainText(figure)
  }
})

test('where this stands is three states, never a date', async ({ page }) => {
  const states = page.locator('.standing-state')
  await expect(states).toHaveText(['Built', 'In build', 'Opening'])
  await expect(page.locator('.standing')).not.toContainText(/\b(20\d\d|Q[1-4])\b/)
})

test('trust: six commitments with their real state, and no certification named', async ({
  page,
}) => {
  const section = page.locator('#trust')
  await expect(section.locator('.trust-cell')).toHaveCount(6)
  for (const state of await section.locator('.trust-state').allInnerTexts()) {
    expect(['Decided', 'Built', 'In build']).toContain(state.trim())
  }
  await expect(section).toContainText('No certification is claimed on this page.')
  await expect(section).not.toContainText(/SOC|ISO|GDPR|CCPA|HIPAA|certified|compliant/)
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
  await page.locator('#trust').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(banner).toHaveAttribute('data-scrolled', 'true')
  expect((await banner.boundingBox())?.y).toBe(0)
  await expect(banner.getByRole('link', { name: 'Request early access' })).toBeInViewport()

  // Every link to a section of this page, written `#id` or `/#id`, names one that exists, once.
  const anchors = await page
    .locator('a[href^="#"], a[href^="/#"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!.split('#')[1]!))
  for (const id of new Set(anchors)) {
    await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1)
  }

  // The button puts the cursor in the field.
  await banner.getByRole('link', { name: 'Request early access' }).click()
  await expect(page.getByRole('textbox', { name: /^Work email/ })).toBeFocused()
})

test('Charlie’s film plays its six beats in order while on screen, and goes round', async ({
  page,
}) => {
  test.slow()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(GLASS)
  await page.waitForSelector('html[data-hydrated="true"]')
  await page.addStyleTag({ content: '.cf { --cf-beat: 500ms; }' })
  await page.keyboard.press('Shift')
  const film = page.locator('.cf')
  await film.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(film).toHaveAttribute('data-running', 'true')

  const stage = page.locator('.cf-stage')
  const seen: string[] = []
  await expect
    .poll(
      async () => {
        const step = (await stage.getAttribute('data-step')) ?? ''
        if (seen.at(-1) !== step) seen.push(step)
        return seen.length >= 7
      },
      { intervals: [80], timeout: 15_000 },
    )
    .toBe(true)
  expect(seen.slice(0, 7)).toEqual(['reads', 'cites', 'holds', 'makes', 'tells', 'asks', 'reads'])
  // The frame restates the list, so it is hidden from a screen reader; the list is not.
  await expect(stage).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.cf-step-button')).toHaveCount(6)

  // Paused, it holds where it was.
  await page.getByRole('button', { name: 'Pause Charlie' }).click()
  const held = await stage.getAttribute('data-step')
  await page.waitForTimeout(1500)
  await expect(stage).toHaveAttribute('data-step', held!)
})

test('under reduced motion Charlie’s film never plays, and a beat is chosen by hand', async ({
  page,
}) => {
  const film = page.locator('.cf')
  await film.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(page.locator('.cf-step-fill--live')).toHaveCount(0)
  await expect(page.locator('.cf-play')).toHaveCount(0)
  await page.locator('.cf-step-button').filter({ hasText: 'Makes the documents' }).click()
  await expect(page.locator('.cf-stage')).toHaveAttribute('data-step', 'makes')
  await page.waitForTimeout(1200)
  await expect(page.locator('.cf-stage')).toHaveAttribute('data-step', 'makes')
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
  await page.goto('/glass')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('a[href="/glass"]')).toHaveCount(0)
})
