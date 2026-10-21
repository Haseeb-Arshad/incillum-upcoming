import { createFileRoute } from '@tanstack/react-router'
import { GlassPage } from '#/components/glass-page.tsx'
import { home } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/**
 * The front page is the presentation.
 *
 * It was `/glass`, off the spine: the same night told as a film, for somebody
 * who wants to be shown rather than read to. It is the page the site is for
 * now, so it keeps the front page's head — the title that carries the hero's
 * headline, the description, and the canonical at `/` — and `/glass` sends
 * anybody holding the old address here.
 */
export const Route = createFileRoute('/')({
  head: () => {
    const base = seoTags({ title: home.title, description: home.description })

    return {
      meta: base.meta,
      links: base.links,
    }
  },
  component: GlassPage,
})
