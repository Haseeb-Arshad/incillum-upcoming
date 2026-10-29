import { createFileRoute } from '@tanstack/react-router'

import { CharliePage } from '#/components/charlie-page.tsx'
import { charlie } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/** /charlie — the colleague inside Incillum, each ability with its real state. */
export const Route = createFileRoute('/charlie')({
  head: () => {
    const base = seoTags({
      path: charlie.path,
      card: 'charlie',
      title: charlie.title,
      description: charlie.description,
    })
    return { meta: base.meta, links: base.links }
  },
  component: CharliePage,
})
