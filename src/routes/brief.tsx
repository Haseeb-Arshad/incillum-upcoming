import { createFileRoute } from '@tanstack/react-router'

import { BriefPage } from '#/components/brief-page.tsx'
import { seoTags } from '#/lib/seo.ts'
import { readBrief } from '#/server/brief.ts'

/** Private, password-protected brief. It is deliberately absent from navigation and the sitemap. */
export const Route = createFileRoute('/brief')({
  loader: () => readBrief(),
  head: () => {
    const base = seoTags({
      path: '/brief',
      title: 'Incillum | Private brief',
      description: 'A sourced overview of Incillum for invited readers.',
    })

    return {
      meta: [...base.meta, { name: 'robots', content: 'noindex, nofollow' }],
      links: base.links,
    }
  },
  component: BriefRoute,
})

function BriefRoute() {
  const initialState = Route.useLoaderData()
  return <BriefPage initialState={initialState} />
}
