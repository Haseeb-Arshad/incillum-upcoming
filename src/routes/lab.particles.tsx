import { createFileRoute } from '@tanstack/react-router'

import { LaunchPage } from '#/components/launch-page.tsx'
import { launch } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/**
 * /lab/particles — the particle launch page, kept off the public site.
 *
 * It was the home page until the harbour edition replaced it. It stays
 * reachable for whoever holds the link, and nothing else: no link from any
 * page, no sitemap entry, and a `noindex` so a crawler that finds the URL
 * anyway does not list it. It is deliberately not in robots.txt — a Disallow
 * would stop a crawler from ever reading the `noindex`, and would advertise the
 * path to anybody who reads the file.
 */
export const Route = createFileRoute('/lab/particles')({
  head: () => {
    const base = seoTags({
      path: '/lab/particles',
      title: launch.title,
      description: launch.description,
    })

    return {
      meta: [...base.meta, { name: 'robots', content: 'noindex, nofollow' }],
      links: base.links,
    }
  },
  component: LaunchPage,
})
