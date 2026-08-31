import { absoluteUrl, siteUrl } from '#/env.ts'
import { brand, seoCopy } from '#/content/site.ts'

/**
 * Head construction.
 *
 * Titles, descriptions, canonical, Open Graph and Twitter tags are produced
 * from one place, so a page can never ship a title without a matching
 * `og:title`.
 */
export function seoTags() {
  const url = absoluteUrl('/')
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
      { title: seoCopy.title },
      { name: 'description', content: seoCopy.description },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: brand.name },
      { property: 'og:title', content: seoCopy.title },
      { property: 'og:description', content: seoCopy.description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:image', content: image },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: `${brand.name} — an AI coworker for finance operations`,
      },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoCopy.title },
      { name: 'twitter:description', content: seoCopy.description },
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
    logo: absoluteUrl('/logo.svg'),
    sameAs: [],
  })
}
