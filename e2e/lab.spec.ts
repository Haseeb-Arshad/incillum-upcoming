import { expect, test } from '@playwright/test'

import { cramped } from './support.ts'

/**
 * /lab/trust: the trust board drawn both ways, for the owner to choose between.
 *
 * It is private in the way `/lab/particles` is, and it has to stay so: no link
 * to it from anywhere, no sitemap entry, a `noindex`. And whichever way each
 * thing is drawn, the board has to hold: nothing touching a border, the gate
 * without a portrait, the approval small. When one way of each is chosen the
 * other, this page and this spec are deleted.
 */
const LAB = '/lab/trust'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(LAB, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('html[data-hydrated="true"]')
})

test('is private: noindex, out of the sitemap, and linked from nowhere', async ({
  page,
  request,
}) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain('/lab')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).not.toContain('/lab')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('a[href^="/lab"]')).toHaveCount(0)
})

test('draws every combination of the emails and the approval, and each one holds', async ({
  page,
}) => {
  const map = page.locator('.trust-map')
  for (const cards of ['named', 'faces'] as const) {
    for (const approve of ['button', 'slide'] as const) {
      await page.locator(`input[name="cards"][value="${cards}"]`).check({ force: true })
      await page
        .locator(`input[name="approve"][value="${approve}"]`)
        .check({ force: true })
      const label = `${cards} / ${approve}`
      await expect(map, label).toHaveAttribute('data-cards', cards)
      await expect(map, label).toHaveAttribute('data-approve', approve)

      // The emails: the portrait always, the name only when it is named.
      await expect(map.locator('.trust-email .avatar'), label).toHaveCount(2)
      const names = map.locator('.trust-email-name')
      await expect(names, label).toHaveCount(cards === 'named' ? 2 : 0)
      await expect(map.locator('.trust-email').first(), label).toContainText(
        'RFQ 8841, framework agreement',
      )
      await expect(map.locator('.trust-out .avatar'), label).toHaveCount(2)

      // The gate has no portrait either way, and the approval is one small thing.
      const gate = map.locator('.trust-gate')
      await expect(gate.locator('.avatar'), label).toHaveCount(0)
      await expect(gate, label).toContainText('James')
      if (approve === 'button') {
        await expect(gate.locator('.trust-approve'), label).toHaveCount(1)
        await expect(gate.locator('.trust-slide'), label).toHaveCount(0)
        await expect(gate.locator('.trust-approve-done'), label).toBeVisible()
      } else {
        await expect(gate.locator('.trust-slide'), label).toHaveCount(1)
        await expect(gate.locator('.trust-approve'), label).toHaveCount(0)
        // Its last frame: the record, and the knob at the far end of the track.
        await expect(gate.locator('.trust-slide-text'), label).toContainText(
          'Approved · 08:14',
        )
        const track = (await gate.locator('.trust-slide').boundingBox())!
        const knob = (await gate.locator('.trust-slide-knob').boundingBox())!
        expect(track.height, label).toBeLessThan(40)
        expect(knob.x + knob.width, label).toBeGreaterThan(track.x + track.width - 8)
        expect(knob.x + knob.width, label).toBeLessThanOrEqual(track.x + track.width)
      }

      expect(await cramped(map), label).toEqual([])
    }
  }
})

test('replays the scene on demand, from its first frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const map = page.locator('.trust-map')
  await page.getByRole('button', { name: 'Replay' }).click()
  // A fresh board is armed, then plays once enough of it is on screen: a phone's column is
  // taller than the screen, so a quarter of it is not in view until the reader has scrolled to it.
  await expect(map).toHaveAttribute('data-scene', /armed|playing/)
  await map.evaluate((element) =>
    element.scrollIntoView({ block: 'start', behavior: 'instant' }),
  )
  await expect(map).toHaveAttribute('data-scene', 'playing')
})
