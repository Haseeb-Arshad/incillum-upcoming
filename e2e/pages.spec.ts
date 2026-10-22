import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * The page after the front page — Charlie — and the masthead that reaches it.
 *
 * The rules under test: the page is in the sitemap and draws its own chrome
 * once; Charlie's abilities carry no state labels, and every outward one is
 * described with the approval it waits for; no certification is named; the
 * masthead has one menu, Product, and a link to the contact memo; the menu
 * opens by pointer and by keyboard, closes on Escape, and every item lands
 * somewhere real. There is no security page.
 */

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForSelector('html[data-hydrated="true"]')
}

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('Charlie: one page, its own chrome, the team’s channel, every outward step approved', async ({
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

  const scene = page.locator('.charlie-scene')
  await expect(scene.locator('.charlie-licence')).toHaveText(/^One quotation/)
  await expect(scene.locator('.charlie-message')).toHaveCount(5)
  // Its figures are the night's.
  for (const figure of ['128.00', '135.68', '16.4%', '20.0%', '1,200']) {
    await expect(scene).toContainText(figure)
  }
  await expect(scene).toContainText('Approved by')

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
