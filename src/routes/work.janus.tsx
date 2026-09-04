import { createFileRoute } from '@tanstack/react-router'

import { JanusStudy } from '#/components/janus-study.tsx'
import { janusSeo } from '#/content/janus.ts'
import { seoTags } from '#/lib/seo.ts'

/**
 * /work/janus — a case study, off the spine.
 *
 * The site is one page with one argument and no navigation, and this is not a
 * second argument. It is a URL that can be handed to somebody who has asked
 * what we have built, and it is deliberately not on the path of a visitor
 * reading the pitch: nothing on the home page links here.
 *
 * It shares the masthead and colophon, because they are the document's chrome
 * rather than the home page's furniture, and a page of this site that did not
 * carry them would read as somebody else's.
 */
export const Route = createFileRoute('/work/janus')({
  head: () => {
    const base = seoTags({
      path: '/work/janus',
      title: janusSeo.title,
      description: janusSeo.description,
    })

    return { meta: base.meta, links: base.links }
  },
  component: JanusPage,
})

function JanusPage() {
  return <JanusStudy />
}
