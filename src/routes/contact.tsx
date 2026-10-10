import { createFileRoute } from '@tanstack/react-router'

import { ContactPage } from '#/components/contact-page.tsx'
import { contact } from '#/content/site.ts'
import { seoTags } from '#/lib/seo.ts'

/**
 * /contact — the memo.
 *
 * Public and in the sitemap: it is the page somebody who wants to say more than
 * an address is sent to. It shares the company's share card like every other
 * page, and owns its canonical (see the note in `__root.tsx`).
 */
export const Route = createFileRoute('/contact')({
  head: () => {
    const base = seoTags({
      path: '/contact',
      title: contact.title,
      description: contact.description,
    })

    return { meta: base.meta, links: base.links }
  },
  component: ContactPage,
})
