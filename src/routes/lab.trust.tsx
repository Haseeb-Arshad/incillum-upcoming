import { createFileRoute } from '@tanstack/react-router'

import { TrustLab } from '#/components/trust-lab.tsx'
import { seoTags } from '#/lib/seo.ts'

/**
 * /lab/trust: the trust board drawn both ways, for choosing between them.
 *
 * Private in the way `/lab/particles` is: reachable by whoever holds the link,
 * nothing else. No link from any page, no sitemap entry, a `noindex`, and not
 * in robots.txt, where a Disallow would hide the `noindex` from a crawler and
 * advertise the path to everybody who reads the file.
 */
export const Route = createFileRoute('/lab/trust')({
  head: () => {
    const base = seoTags({
      path: '/lab/trust',
      title: 'Incillum | The trust board, two ways',
      description: 'A private page for choosing how the trust board is drawn.',
    })

    return {
      meta: [...base.meta, { name: 'robots', content: 'noindex, nofollow' }],
      links: base.links,
    }
  },
  component: TrustLab,
})
