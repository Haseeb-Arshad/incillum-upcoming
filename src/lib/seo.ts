import { absoluteUrl, siteUrl } from '#/env.ts'
import { brand, seoCopy } from '#/content/site.ts'

/**
 * A page's own title, description and canonical path. Everything is optional
 * and falls back to the home page's, so the common case stays `seoTags()`.
 */
interface PageSeo {
  path?: string
  title?: string
  description?: string
}

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
  const title = page.title ?? seoCopy.title
  const description = page.description ?? seoCopy.description
  const url = absoluteUrl(path)
  /**
   * PNG, not SVG. Most social platforms — X, LinkedIn, Slack, iMessage — either
   * refuse an SVG `og:image` outright or rasterise it without the page's fonts,
   * which on a card whose whole content is set in a self-hosted serif means a
   * blank rectangle. `public/og-image.png` is the card rendered at 1200x630
   * with the real faces embedded.
   */
  const image = absoluteUrl('/og-image.png')

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
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: `${brand.name} — the work doesn’t leave when you do`,
      },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

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
    description: seoCopy.description,
    logo: absoluteUrl('/logo.png'),
    sameAs: [],
  })
}
