import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The page after the front page — Charlie — and the masthead that reaches it.
 *
 * The rules under test: the page is in the sitemap and draws its own chrome
 * once; its film has a chapter for each step, and a chapter plays it from
 * there, and nothing under the film says those steps again; under it Charlie is
 * shown as an agent (a channel, who it talks to, where it stops), with no
 * state labels, and every outward step described with the approval it waits
 * for; no certification is named; the masthead has one menu, Product, and a link to the contact memo; the menu
 * opens by pointer and by keyboard, closes on Escape, and every item lands
 * somewhere real. There is no security page.
 */

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
}

/**
 * Serves the film in byte ranges, as the CDN in front of the site does. The
 * local preview (Nitro's node server) sends a file whole, and a browser cannot
 * seek a film sent whole — so without this no chapter could be shown to play
 * from its step here, though it does on the site.
 */
async function serveFilmInRanges(page: Page) {
  const film = readFileSync(
    new URL('../public/charlie/charlie-at-work.mp4', import.meta.url),
  )
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
  // No night on this page: the masthead is a pane over white paper, not a dark bar.
  await expect(page.locator('[data-inverted]')).toHaveCount(0)
  await expect(page.getByRole('banner')).toHaveAttribute('data-tone', 'day')
  expect(await noOverflow(page)).toBe(true)

  // The film, cut from Studio's own pages, with a chapter for each step.
  const video = page.locator('video.reel-video')
  await expect(video).toHaveAttribute('src', '/charlie/charlie-at-work.mp4')
  await expect(video).toHaveAttribute('poster', '/charlie/charlie-at-work.webp')
  const chapters = page.locator('.reel-chapter')
  await expect(chapters).toHaveCount(6)

  // The film's own chapters are the only way into its steps: the page does not say them again.
  await expect(page.locator('.cp-step')).toHaveCount(0)
  await expect(page.locator('.cp-step-still')).toHaveCount(0)
  await expect(page.locator('.protect-card')).toHaveCount(0)

  // A chapter plays the film from its step, and is marked as the one playing.
  await chapters.nth(2).scrollIntoViewIfNeeded()
  await chapters.nth(2).click()
  await expect(chapters.nth(2)).toHaveAttribute('aria-current', 'step')
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.currentTime),
  ).toBeGreaterThanOrEqual(20.9)

  // Under the film, Charlie as an agent: spoken to in a team's channel, with the morning in it.
  const talk = page.locator('.agent-talk')
  await expect(talk.getByRole('heading', { level: 2 })).toHaveText(
    'Talk to Charlie like a colleague.',
  )
  await expect(talk.locator('.agent-points li')).toHaveCount(3)
  const channel = talk.locator('.agent-channel')
  await expect(channel).toContainText('#rfq-8841')
  await expect(channel.locator('.agent-message')).toHaveCount(5)
  await expect(channel.locator('.agent-mention')).toHaveText(['@Sara', '@Charlie'])
  // A person asks in plain words; Charlie drafts, and the request waits for a named approval.
  await expect(channel).toContainText('ask our approved suppliers for a firm price')
  await expect(channel.locator('.agent-draft')).toContainText('Approved by James · 08:14')
  await expect(channel.locator('.agent-message').last()).toContainText('Sent.')

  // Who it talks to: each card says what has to happen first, and none is a state label.
  const reach = page.locator('.agent-reach')
  await expect(reach.locator('.agent-reach-card')).toHaveCount(3)
  await expect(reach.locator('.agent-reach-card').nth(1)).toContainText(
    'Sent once a person approves',
  )
  await expect(reach.locator('.agent-reach-card').nth(2)).toContainText(
    'Called once a person approves',
  )

  // Where it stops: what it does alone, what waits for a person, what it never does.
  const limits = page.locator('.agent-limits')
  await expect(limits.locator('.agent-limit')).toHaveCount(3)
  await expect(limits.locator('.agent-limit').nth(1)).toContainText('Sends the quotation')
  await expect(limits.locator('.agent-limit').nth(2)).toContainText(
    'Sends or commits without an approval',
  )
  await expect(page.locator('body')).not.toContainText(
    /Decided|In build|Planned|Not held/,
  )

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
