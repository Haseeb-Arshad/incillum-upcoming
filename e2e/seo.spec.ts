import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/**
 * What a crawler and a link preview see, held to what the page is.
 *
 * Every page in the sitemap has its own title, its own canonical and a share
 * card that is a real PNG at the declared size, with the same words for X as
 * for everybody else; the sitemap names exactly the public pages; robots.txt
 * points at it; the touch icon and the structured data are there; and the
 * private pages stay out of all of it.
 */

const meta = (
  page: Page,
  attribute: 'name' | 'property',
  key: string,
) => page.locator(`meta[${attribute}="${key}"]`)

test('every page in the sitemap has its own head and a share card that is really there', async ({
  page,
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
  expect(urls.length).toBeGreaterThanOrEqual(4)
  expect(new Set(urls).size).toBe(urls.length)

  const titles = new Set<string>()
  for (const url of urls) {
    const path = new URL(url).pathname
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    expect(title, path).toBeTruthy()
    titles.add(title)
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', url)
    await expect(meta(page, 'property', 'og:url'), path).toHaveAttribute('content', url)
    await expect(meta(page, 'property', 'og:title'), path).toHaveAttribute(
      'content',
      title,
    )
    await expect(meta(page, 'name', 'twitter:title'), path).toHaveAttribute(
      'content',
      title,
    )
    await expect(meta(page, 'name', 'twitter:card'), path).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(meta(page, 'name', 'robots'), path).toHaveCount(0)

    const image = (await meta(page, 'property', 'og:image').getAttribute('content'))!
    expect(await meta(page, 'name', 'twitter:image').getAttribute('content'), path).toBe(
      image,
    )
    expect(
      await meta(page, 'name', 'twitter:image:alt').getAttribute('content'),
      path,
    ).toBe(await meta(page, 'property', 'og:image:alt').getAttribute('content'))
    // The card is served from this origin's own path (the head names the public origin).
    const response = await request.get(new URL(image).pathname)
    expect(response.status(), image).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')
    const bytes = await response.body()
    expect(bytes.subarray(1, 4).toString()).toBe('PNG')
    expect(bytes.readUInt32BE(16)).toBe(1200)
    expect(bytes.readUInt32BE(20)).toBe(630)
  }
  // Each page says what it is: no two share a title.
  expect(titles.size).toBe(urls.length)
})

test('the front page and Charlie carry their own cards, and the head says what the page says', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(await meta(page, 'property', 'og:image').getAttribute('content')).toMatch(
    /og-image-v4\.png$/,
  )
  await expect(page).toHaveTitle('Incillum | Intelligence for commercial work')
  expect(await meta(page, 'property', 'og:image:alt').getAttribute('content')).toContain(
    'Intelligence for commercial work.',
  )
  await page.goto('/charlie', { waitUntil: 'domcontentloaded' })
  expect(await meta(page, 'property', 'og:image').getAttribute('content')).toMatch(
    /og-charlie-v1\.png$/,
  )
})

test('robots.txt points at the sitemap, the icons are served, and the structured data parses', async ({
  page,
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/)
  expect(robots).not.toMatch(/Disallow/)

  for (const path of ['/apple-touch-icon.png', '/icon-48.png', '/favicon.svg']) {
    expect((await request.get(path)).status(), path).toBe(200)
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'sizes',
    '180x180',
  )

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  const types = blocks.map((block) => (JSON.parse(block) as { '@type': string })['@type'])
  expect(types).toEqual(['Organization', 'WebSite'])
})

test('the private pages say noindex and are in neither the sitemap nor robots.txt', async ({
  page,
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const robots = await (await request.get('/robots.txt')).text()
  for (const path of ['/brief', '/lab/trust', '/lab/particles']) {
    expect(xml, path).not.toContain(path)
    expect(robots, path).not.toContain(path)
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(meta(page, 'name', 'robots'), path).toHaveAttribute('content', /noindex/)
  }
})
