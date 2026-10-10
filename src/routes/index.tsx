import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/components/home-page.tsx'
import { home } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

export const Route = createFileRoute('/')({
  head: () => {
    const base = seoTags({ title: home.title, description: home.description })

    return {
      meta: base.meta,
      links: base.links,
    }
  },
  component: HomePage,
})
