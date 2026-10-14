import { createFileRoute } from '@tanstack/react-router'

import { GlassPage } from '#/components/glass-page.tsx'
import { glass } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/**
 * /glass — the presentation, off the spine.
 *
 * The same argument as the home page, told as a film, for handing to somebody
 * who wants to be shown rather than read to. It is not a second front door:
 * nothing on the site links here, it is not in the sitemap, and it carries a
 * `noindex` so that a search result for the company lands on the page the site
 * is for. Like `/lab/particles` it is deliberately not in robots.txt — a
 * Disallow would stop a crawler from ever reading the `noindex`.
 *
 * Promoting it is two deletions: the robots tag here, and the line in
 * `e2e/glass.spec.ts` that holds it unlisted.
 */
export const Route = createFileRoute('/glass')({
  head: () => {
    const base = seoTags({
      path: '/glass',
      title: glass.title,
      description: glass.description,
    })

    return {
      meta: [...base.meta, { name: 'robots', content: 'noindex, nofollow' }],
      links: base.links,
    }
  },
  component: GlassPage,
})
