import { describe, expect, it } from 'vitest'

import { readFileSync } from 'node:fs'

import { brand, charlie, hero, home } from '#/content/site.ts'
import { organizationJsonLd, seoTags, websiteJsonLd } from '#/lib/seo.ts'

/**
 * The head, held to the two rules that were broken once already.
 *
 * A title and a share card are the only parts of this site that never render
 * where the people who build it can see them. The page was rewritten around a
 * new headline and a supplied mark, and both of these went on describing the
 * previous version to everybody who pasted the link — for weeks, silently,
 * because nothing on the screen was wrong.
 *
 * These are the assertions that fail next time instead:
 *
 *   1. the title says what the page's first heading says,
 *   2. the card's alt text describes the card, and every tag that should carry
 *      the same value carries the same value.
 *
 * `e2e/site.spec.ts` covers the half of this that a unit test cannot: that the
 * file at `og:image` exists, is a PNG, and is the size the tags promise.
 */

/** The `content` of the first meta entry carrying `property`. */
function og(tags: ReturnType<typeof seoTags>, property: string): string {
  const found = tags.meta.find(
    (tag) => 'property' in tag && tag.property === property,
  ) as { content?: string } | undefined
  expect(found, `no meta with property="${property}"`).toBeTruthy()
  return found!.content!
}

/** The `content` of the first meta entry carrying `name`. */
function named(tags: ReturnType<typeof seoTags>, name: string): string {
  const found = tags.meta.find((tag) => 'name' in tag && tag.name === name) as
    { content?: string } | undefined
  expect(found, `no meta with name="${name}"`).toBeTruthy()
  return found!.content!
}

describe('the title', () => {
  /**
   * The rule, and the whole reason this file exists.
   *
   * A visitor arriving from a search result or a pasted link should read the
   * same sentence in the preview and at the top of the page. When these two
   * drift, nothing looks broken — the link simply promises a different company
   * from the one it opens.
   */
  it('carries the hero’s headline', () => {
    const headline = hero.headline.replace(/\.$/, '').toLowerCase()
    expect(home.title.toLowerCase()).toContain(headline)
    expect(seoTags().meta[0]).toEqual({ title: home.title })
  })

  it('names the company before it describes it', () => {
    expect(home.title.startsWith('Incillum')).toBe(true)
    expect(charlie.title.startsWith('Charlie')).toBe(true)
  })

  /**
   * Google truncates a title around 60 characters and a description around 160,
   * and the truncation lands mid-word. Both are checked at the point they are
   * written rather than discovered in a search result.
   */
  it('survives a search result without truncation', () => {
    expect(home.title.length).toBeLessThanOrEqual(60)
    expect(home.description.length).toBeLessThanOrEqual(160)
    expect(charlie.title.length).toBeLessThanOrEqual(60)
    expect(charlie.description.length).toBeLessThanOrEqual(200)
  })

  it('does not carry the previous positioning', () => {
    const stale = /doesn’t leave when you do/i
    expect(home.title).not.toMatch(stale)
    expect(home.description).not.toMatch(stale)
    // Nor the retired launch page's: the defaults are the front page's.
    expect(seoTags().meta).not.toContainEqual({
      property: 'og:title',
      content: 'Incillum - A different kind of intelligence.',
    })
  })
})

describe('the share card’s tags', () => {
  const tags = seoTags()

  /**
   * The path is versioned on purpose — see the note on `shareCard` in
   * `lib/seo.ts`. Every platform caches a card against its URL, so a redesign
   * served at the old path is a redesign nobody is shown. This asserts the
   * mechanism is still in place; the number itself is free to move.
   */
  it('points at a versioned path so a redesign is re-fetched', () => {
    expect(og(tags, 'og:image')).toMatch(/\/og-image-v\d+\.png$/)
    expect(og(seoTags({ card: 'charlie' }), 'og:image')).toMatch(
      /\/og-charlie-v\d+\.png$/,
    )
  })

  it('is absolute, which is the only form a crawler resolves', () => {
    expect(og(tags, 'og:image')).toMatch(/^https?:\/\//)
  })

  it('describes what is actually printed on the card', () => {
    const alt = og(tags, 'og:image:alt')
    expect(alt).toContain('Incillum')
    expect(alt).toContain(hero.headline)
    expect(og(seoTags({ card: 'charlie' }), 'og:image:alt')).toContain(
      charlie.hero.headline,
    )
    expect(named(tags, 'twitter:image:alt')).toBe(alt)
  })

  it('is a real PNG at the declared size, and the retired card is gone', () => {
    for (const card of [tags, seoTags({ card: 'charlie' })]) {
      const file = new URL(
        `../../public${new URL(og(card, 'og:image')).pathname}`,
        import.meta.url,
      )
      const bytes = readFileSync(file)
      expect(bytes.subarray(1, 4).toString()).toBe('PNG')
      expect(bytes.readUInt32BE(16)).toBe(Number(og(card, 'og:image:width')))
      expect(bytes.readUInt32BE(20)).toBe(Number(og(card, 'og:image:height')))
    }
    expect(() =>
      readFileSync(new URL('../../public/og-image-v3.png', import.meta.url)),
    ).toThrow()
  })

  it('declares the dimensions the generator renders', () => {
    expect(og(tags, 'og:image:width')).toBe('1200')
    expect(og(tags, 'og:image:height')).toBe('630')
    expect(og(tags, 'og:image:type')).toBe('image/png')
  })

  /**
   * X reads the `twitter:` block and ignores the Open Graph one where both are
   * present, so a card corrected in only one of them is corrected on every
   * platform except the one people paste links into most.
   */
  it('gives X the same card and the same words as everybody else', () => {
    expect(named(tags, 'twitter:image')).toBe(og(tags, 'og:image'))
    expect(named(tags, 'twitter:title')).toBe(og(tags, 'og:title'))
    expect(named(tags, 'twitter:description')).toBe(og(tags, 'og:description'))
    expect(named(tags, 'twitter:card')).toBe('summary_large_image')
  })
})

describe('the structured data', () => {
  it('names the company and the site, and claims nothing it cannot back', () => {
    type Data = { '@type': string; name: string; description: string }
    const organization = JSON.parse(organizationJsonLd()) as Data
    const website = JSON.parse(websiteJsonLd()) as Data
    expect(organization['@type']).toBe('Organization')
    expect(website['@type']).toBe('WebSite')
    for (const data of [organization, website]) {
      expect(data.name).toBe(brand.name)
      expect(data.description).toBe(home.description)
    }
    expect(JSON.stringify([organization, website])).not.toMatch(
      /aggregateRating|review|SearchAction|employee/i,
    )
  })
})

describe('a second page', () => {
  const tags = seoTags({ path: '/work/janus', title: 'A title', description: 'A body.' })

  it('takes the company’s card and its own canonical', () => {
    expect(og(tags, 'og:image')).toBe(og(seoTags(), 'og:image'))
    expect(tags.links[0]!.href).toMatch(/\/work\/janus$/)
    expect(og(tags, 'og:url')).toMatch(/\/work\/janus$/)
  })
})
