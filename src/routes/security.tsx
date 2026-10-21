import { createFileRoute } from '@tanstack/react-router'

import { SecurityPage } from '#/components/security-page.tsx'
import { security } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/** /security — the controls and the certifications, each with its real state. */
export const Route = createFileRoute('/security')({
  head: () => {
    const base = seoTags({
      path: security.path,
      title: security.title,
      description: security.description,
    })
    return { meta: base.meta, links: base.links }
  },
  component: SecurityPage,
})
