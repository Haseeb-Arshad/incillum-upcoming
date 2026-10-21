import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The pages after the front page — Charlie and security — and the masthead's
 * menus that reach them.
 *
 * The rules under test: each page is in the sitemap and draws its own chrome
 * once; Charlie's conversation is invented and says so first, and every
 * outward ability is planned; security names the frameworks a buyer looks for
 * only with a status that says they are not held; the menus open by pointer
 * and by keyboard, close on Escape, and every item lands somewhere real.
 */

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForSelector('html[data-hydrated="true"]')
}

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('Charlie: one page, its own chrome, the invented conversation first, nothing outward built', async ({
  page,
}) => {
  await open(page, '/charlie')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /asks before anything leaves/,
  )
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(page.locator('[data-inverted]')).toHaveCount(1)
  expect(await noOverflow(page)).toBe(true)

  // The scene says what it is before anything in it is shown.
  const scene = page.locator('.charlie-scene')
  await expect(scene.locator('.charlie-licence')).toHaveText(
    /^Invented, and not yet built/,
  )
  await expect(scene.locator('.charlie-message')).toHaveCount(5)
  // Its figures are the night's.
  for (const figure of ['128.00', '135.68', '16.4%', '20.0%', '1,200']) {
    await expect(scene).toContainText(figure)
  }
  await expect(scene).toContainText('Approved by')

  // Every ability has a state, and the outward ones are planned.
  const ability = (title: string) =>
    page.locator('.trust-cell', { has: page.getByRole('heading', { name: title }) })
  await expect(page.locator('.trust-cell')).toHaveCount(7)
  for (const title of ['Asks approved suppliers', 'Calls and books']) {
    await expect(ability(title).locator('.trust-state')).toHaveText('Planned')
  }
  await expect(ability('Asks before anything leaves').locator('.trust-state')).toHaveText(
    'Decided',
  )
  for (const state of await page.locator('.trust-state').allInnerTexts()) {
    expect(state.trim()).not.toBe('Built')
  }

  await expect(page.locator('body')).not.toContainText(
    /trusted by|customers include|testimonial|SOC 2|ISO|GDPR|stay with the work/i,
  )
})

test('security: controls with their state, and every framework named as not held', async ({
  page,
}) => {
  await open(page, '/security')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Security, stated plainly.',
  )
  expect(await noOverflow(page)).toBe(true)

  const controls = page.locator('.security-control')
  expect(await controls.count()).toBeGreaterThanOrEqual(8)
  for (const state of await controls.locator('.trust-state').allInnerTexts()) {
    expect(['Decided', 'Built', 'In build', 'Planned']).toContain(state.trim())
  }

  // A framework's card opens on its status, so it is never read as a badge.
  const frameworks = page.locator('.security-framework')
  expect(await frameworks.count()).toBeGreaterThanOrEqual(4)
  for (const card of await frameworks.all()) {
    const first = card.locator(':scope > *').first()
    await expect(first).toHaveText(/^(Not held · planned|Not yet assessed)$/)
  }
  await expect(page.getByText(/^Not held means not held/)).toBeVisible()
  await expect(page.locator('body')).not.toContainText(
    /\bcertified\b|\bcompliant\b|trusted by/i,
  )

  // The data commitments are the front page's own grid.
  await expect(page.locator('#trust .trust-cell')).toHaveCount(6)
})

test('both pages are in the sitemap, and the front page links to them', async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/charlie</loc>')
  expect(sitemap).toContain('/security</loc>')
  await open(page, '/')
  await expect(page.locator('a[href="/charlie"]').first()).toBeAttached()
  await expect(page.locator('a[href="/security"]').first()).toBeAttached()
})

test('every menu item lands somewhere real', async ({ page, request }) => {
  await open(page, '/')
  const hrefs = await page
    .locator('.site-menu-item')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  expect(hrefs.length).toBeGreaterThanOrEqual(6)
  for (const href of new Set(hrefs)) {
    const [path, hash] = href.split('#')
    expect((await request.get(path || '/')).status(), href).toBe(200)
    if (hash) await expect(page.locator(`[id="${hash}"]`), href).toHaveCount(1)
  }
})

test('a menu opens from the keyboard, moves with the arrows and closes on Escape', async ({
  page,
}) => {
  await open(page, '/security')
  const button = page.getByRole('button', { name: 'Trust' })
  test.skip(!(await button.isVisible()), 'the menus show from a laptop’s width')
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await button.focus()
  await page.keyboard.press('ArrowDown')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(
    page.locator('.site-menu-item').filter({ hasText: 'Security' }),
  ).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(
    page.locator('.site-menu-item').filter({ hasText: 'Your figures' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(button).toBeFocused()
})

test('a menu opens on hover where a pointer hovers, and closes when it leaves', async ({
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
