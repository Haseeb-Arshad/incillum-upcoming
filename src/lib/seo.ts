import { absoluteUrl, siteUrl } from '#/env.ts'
import { brand, charlie, hero, home } from '#/content/site.ts'

/**
 * A page's own title, description and canonical path. Everything is optional
 * and falls back to the home page's, so the common case stays `seoTags()`.
 */
interface PageSeo {
  path?: string
  title?: string
  description?: string
  /** Which share card: the company's (the default) or Charlie's. */
  card?: keyof typeof shareCards
}

/**
 * The share card.
 *
 * ── PNG, not SVG ──────────────────────────────────────────────────────────
 *
 * Most platforms — X, LinkedIn, Slack, iMessage — either refuse an SVG
 * `og:image` outright or rasterise it without the page's fonts, which on a card
 * whose whole content is set in a self-hosted serif means a blank rectangle.
 * The file is generated at 1200x630 with the real faces embedded, from the
 * site's own copy and tokens, by `design/generate-og.mjs`.
 *
 * ── Why the path carries a revision ───────────────────────────────────────
 *
 * Because every platform caches a card against its URL and re-fetches on its
 * own schedule — LinkedIn for about a week, X until something makes it
 * re-scrape. Replacing the bytes at a path that has already been shared fixes
 * the card for nobody: the old one keeps being served from their cache, which
 * is exactly how a redesigned page went on showing a headline it no longer had.
 * A new path is fetched on the next scrape.
 *
 * So a redesign of the card is a **rename**, not an overwrite. Bump the number
 * here and in `design/generate-og.mjs`, delete the file the old path pointed
 * at, and re-share the link once so the platforms re-read this head. The
 * dimensions travel with the path for the same reason `og:image:width` exists
 * at all — a platform that trusts the declared size and gets another lays the
 * card out wrong before it has finished loading it. `e2e/site.spec.ts` fetches
 * this path and checks the PNG's own header against the two numbers below.
 */
const shareCards = {
  home: { path: '/og-image-v4.png', headline: hero.headline },
  charlie: { path: '/og-charlie-v1.png', headline: charlie.hero.headline },
} as const

/** The size every card is rendered at, and declared at, so no platform lays one out wrong. */
const cardSize = { width: '1200', height: '630' } as const

/**
 * Head construction.
 *
 * Titles, descriptions, canonical, Open Graph and Twitter tags are produced
 * from one place, so a page can never ship a title without a matching
 * `og:title`. That guarantee is the reason a second page takes an argument
 * here rather than assembling its own tags: a route that built its head by
 * hand would be one careless commit away from a canonical pointing at `/`.
 *
 * The card image is shared deliberately. It is the company's card, not the
 * page's, and a second page without one would fall back to no image at all,
 * which is worse than a general one.
 */
export function seoTags(page: PageSeo = {}) {
  const path = page.path ?? '/'
  const title = page.title ?? home.title
  const description = page.description ?? home.description
  const url = absoluteUrl(path)
  const card = shareCards[page.card ?? 'home']
  const image = absoluteUrl(card.path)
  const alt = `${brand.name} | ${card.headline}`

  return {
    meta: [
      { title },
      { name: 'description', content: description },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: brand.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:image', content: image },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: cardSize.width },
      { property: 'og:image:height', content: cardSize.height },
      /**
       * Read off the card rather than written for it. The image is the wordmark
       * over the hero's own headline, so composing the alt text from the same
       * two fields keeps the description of the picture true to the picture —
       * and makes it impossible for the two to drift the way the card itself
       * drifted from the page.
       */
      { property: 'og:image:alt', content: alt },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: alt },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

/**
 * The pages a crawler is told about, in one list: the sitemap is built from it
 * and `e2e/seo.spec.ts` visits every entry. A page that is private (`/brief`,
 * the `/lab` pages) is not here and says `noindex` itself; a page that is here
 * must have its own canonical and title, which the test checks.
 */
export const sitePages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/charlie', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/work/janus', changefreq: 'yearly', priority: '0.4' },
] as const

/**
 * Organization structured data.
 *
 * Deliberately minimal: no `aggregateRating`, no `review`, no employee count,
 * no founding claims that cannot be evidenced. A pre-launch company that
 * publishes structured data it cannot back is making its first public claim a
 * false one.
 */
export function organizationJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: siteUrl,
    description: home.description,
    logo: absoluteUrl('/logo.png'),
    sameAs: [],
  })
}

/**
 * The site itself, as a `WebSite`, so a search result can name it. No
 * `SearchAction`: the site has no search, and structured data for a feature
 * that is not there is a claim the page cannot back.
 */
export function websiteJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: siteUrl,
    description: home.description,
    inLanguage: 'en',
  })
}
