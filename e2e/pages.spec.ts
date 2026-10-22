import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The page after the front page — Charlie — and the masthead that reaches it.
 *
 * The rules under test: the page is in the sitemap and draws its own chrome
 * once; its film has a chapter for each step, and a chapter or a step's link
 * plays it from there; Charlie's abilities carry no state labels, and every
 * outward one is described with the approval it waits for; no certification is
 * named; the masthead has one menu, Product, and a link to the contact memo; the menu
 * opens by pointer and by keyboard, closes on Escape, and every item lands
 * somewhere real. There is no security page.
 */

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForSelector('html[data-hydrated="true"]')
}

/**
 * Serves the film in byte ranges, as the CDN in front of the site does. The
 * local preview (Nitro's node server) sends a file whole, and a browser cannot
 * seek a film sent whole — so without this no chapter could be shown to play
 * from its step here, though it does on the site.
 */
async function serveFilmInRanges(page: Page) {
  const film = readFileSync(new URL('../public/charlie/charlie-at-work.mp4', import.meta.url))
  await page.route('**/charlie/charlie-at-work.mp4', async (route) => {
    const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers()['range'] ?? '')
    const start = range ? Number(range[1]) : 0
    const end = range?.[2] ? Number(range[2]) : film.length - 1
    await route.fulfill({
      status: range ? 206 : 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1),
        ...(range ? { 'Content-Range': `bytes ${start}-${end}/${film.length}` } : {}),
      },
      body: film.subarray(start, end + 1),
    })
  })
}

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('Charlie: one page, its own chrome, the film of Charlie at work, every outward step approved', async ({
  page,
}) => {
  await serveFilmInRanges(page)
  await open(page, '/charlie')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Every decision yours/)
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(page.locator('[data-inverted]')).toHaveCount(1)
  expect(await noOverflow(page)).toBe(true)

  // The film, cut from Studio's own pages, with a chapter for each step.
  const video = page.locator('video.reel-video')
  await expect(video).toHaveAttribute('src', '/charlie/charlie-at-work.mp4')
  await expect(video).toHaveAttribute('poster', '/charlie/charlie-at-work.webp')
  const chapters = page.locator('.reel-chapter')
  await expect(chapters).toHaveCount(6)

  // Six steps, each with its still of the Studio page it happens on.
  await expect(page.locator('.cp-step')).toHaveCount(6)
  for (const still of await page.locator('.cp-step-still img').all()) {
    await still.scrollIntoViewIfNeeded()
    await expect.poll(() => still.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  }

  // A chapter plays the film from its step, and is marked as the one playing.
  await chapters.nth(2).scrollIntoViewIfNeeded()
  await chapters.nth(2).click()
  await expect(chapters.nth(2)).toHaveAttribute('aria-current', 'step')
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThanOrEqual(20.9)
  // So does a step's own link, which brings the film back on screen.
  await page.locator('.cp-step').nth(4).getByRole('button', { name: 'Watch this step' }).click()
  await expect(chapters.nth(4)).toHaveAttribute('aria-current', 'step')
  await expect(video).toBeInViewport()

  // The abilities are cards, without a state on any of them.
  const ability = (title: string) =>
    page.locator('.protect-card', { has: page.getByRole('heading', { name: title }) })
  await expect(page.locator('.protect-card')).toHaveCount(7)
  await expect(ability('Asks approved suppliers')).toContainText(/once someone approves/)
  await expect(page.locator('body')).not.toContainText(/Decided|In build|Planned|Not held/)

  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers include|testimonial|SOC 2|ISO\/IEC|GDPR|stay with the work/i,
  )
})

test('under reduced motion the Charlie film never starts by itself', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, '/charlie')
  const video = page.locator('video.reel-video')
  await video.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true)
  await expect(page.getByRole('button', { name: 'Play the film' }).first()).toBeVisible()
})

test('Charlie is in the sitemap and the front page links to it; there is no security page', async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/charlie</loc>')
  expect(sitemap).not.toContain('/security</loc>')
  await open(page, '/')
  await expect(page.locator('a[href="/charlie"]').first()).toBeAttached()
  await expect(page.locator('a[href="/security"]')).toHaveCount(0)
})

test('the masthead has one menu, Product, with Charlie in it, and a link to the memo', async ({
  page,
  request,
}) => {
  await open(page, '/')
  await expect(page.locator('.site-menu-button')).toHaveText(['Product'])
  const hrefs = await page
    .locator('.site-menu-item')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  expect(hrefs).toEqual(['/charlie'])
  await expect(page.locator('.site-menu-link')).toHaveText(['Contact'])
  for (const href of ['/charlie', '/contact']) {
    expect((await request.get(href)).status(), href).toBe(200)
  }
})

test('the menu opens from the keyboard, moves with the arrows and closes on Escape', async ({
  page,
}) => {
  await open(page, '/charlie')
  const button = page.getByRole('button', { name: 'Product' })
  test.skip(!(await button.isVisible()), 'the menus show from a laptop’s width')
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await button.focus()
  await page.keyboard.press('ArrowDown')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  const charlie = page.locator('.site-menu-item').filter({ hasText: 'Charlie' })
  await expect(charlie).toBeFocused()
  // One item: the arrows wrap onto it.
  await page.keyboard.press('ArrowDown')
  await expect(charlie).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(button).toBeFocused()
})

test('the menu opens on hover where a pointer hovers, and closes when it leaves', async ({
  page,
}) => {
  await open(page, '/charlie')
  const button = page.getByRole('button', { name: 'Product' })
  test.skip(!(await button.isVisible()), 'the menus show from a laptop’s width')
  await button.hover()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(
    page.locator('.site-menu-item').filter({ hasText: 'Charlie' }),
  ).toBeVisible()
  await page.mouse.move(10, 600)
  await expect(button).toHaveAttribute('aria-expanded', 'false')
})
