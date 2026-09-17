import { createFileRoute } from '@tanstack/react-router'

import { Access } from '#/components/access.tsx'
import { Boundary } from '#/components/boundary.tsx'
import { EarlyAccess } from '#/components/early-access.tsx'
import { Evidence } from '#/components/evidence.tsx'
import { FirstBuild } from '#/components/first-build.tsx'
import { Hero } from '#/components/hero.tsx'
import { Night } from '#/components/night.tsx'
import { seoTags } from '#/lib/seo.ts'

/** One argument: the work, one illustrative night, the evidence, and an invitation. */
export const Route = createFileRoute('/')({
  /**
   * The canonical, and only the canonical. Everything else in this page's head
   * — title, description, Open Graph, Twitter — is the site default and already
   * comes from the root. The link lives here rather than there because links
   * concatenate across nested routes while meta deduplicates, so a canonical
   * emitted by the root would appear a second time on every other page.
   */
  head: () => ({ links: seoTags().links }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <Night />
      <Boundary />
      <Evidence />
      <FirstBuild />
      <Access />
      <EarlyAccess />
    </>
  )
}
