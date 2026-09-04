import { createFileRoute } from '@tanstack/react-router'

import { Access } from '#/components/access.tsx'
import { Boundary } from '#/components/boundary.tsx'
import { EarlyAccess } from '#/components/early-access.tsx'
import { Evidence } from '#/components/evidence.tsx'
import { FirstBuild } from '#/components/first-build.tsx'
import { Hero } from '#/components/hero.tsx'
import { Night } from '#/components/night.tsx'
import { Standing } from '#/components/standing.tsx'
import { seoTags } from '#/lib/seo.ts'

/**
 * incillum.com — the work doesn't leave when you do.
 *
 *   ──  Masthead      who is asking                          ← __root.tsx
 *   00  Hero          the thesis, the proof beat, and the one thing asked for
 *   ┌── the page goes dark ───────────────────────────────────────────────┐
 *   01  Night         the unattended hours: the plate, the instrument, and
 *                     one request carried from 23:47 to 08:04
 *   └── and comes back to paper, at the hour a person returns ────────────┘
 *   02  Boundary      where it stops, which is the product
 *   03  Evidence      one line of that quotation, with its provenance
 *   04  FirstBuild    RFQ to commercial decision, narrowly
 *   05  Standing      how far along the build actually is
 *   06  Access        what is decided about your data, and what is not
 *   07  EarlyAccess   who this is for, and the form a second time
 *   ──  Colophon      the other door, and the motto            ← __root.tsx
 *
 * One argument, one conversion, no navigation. Everything a launched company's
 * site does well — a product tour, a demo, a pricing page — is the wrong
 * instrument at this moment, because the visitor has not yet accepted the
 * premise that software can be trusted to carry commercial work overnight. The
 * page has to win that first, and then ask for an address.
 *
 * ── The band, which is the whole design ────────────────────────────────────
 *
 * §01 is one inverted region running full bleed for four screens. The page is
 * paper while somebody is at their desk, goes dark when the office empties, and
 * returns to paper at 08:04 — which is the last beat of the thread and the
 * moment a person picks the work back up. A reader scrolls through a night.
 *
 * That is the one thing on this site a visitor will still be able to describe a
 * week later, and it is the reason the sections inside it are in that order:
 * the plate says where we are, the instrument says how long it lasts, and the
 * thread is what happens during it. Reordering them, or lifting one out onto
 * paper, does not cost a layout — it costs the argument.
 *
 * ── What came out, and why ─────────────────────────────────────────────────
 *
 * The previous page ran nine sections around accounts payable, and three of
 * them are gone rather than rewritten:
 *
 *   · `Overnight`, three separate night scenes, folded into the one thread. Its
 *     job was to make the night concrete, and one request followed all the way
 *     through does that better than three unrelated fragments — a reader who
 *     stays with one story has understood the product, where a reader given
 *     three has been given a list.
 *   · `Direction`, four natural-language instructions with what each hands
 *     back. Good material, and it is a capability display: it argues that the
 *     product is broad at the exact moment this page needs to argue that it is
 *     narrow.
 *   · `Scope`, "a coworker, not a copilot", six entries across two columns. Its
 *     strongest half was the boundary, and the boundary is now §02, standing on
 *     its own with more force than it had as the right-hand column of a
 *     comparison.
 *
 * All three are in the history. The test for putting one back is not "is this
 * true and interesting" — most of what could be added is — but "does a stranger
 * need this before deciding whether to leave an address".
 *
 * ── Why the boundary is second and not last ────────────────────────────────
 *
 * Because it is the answer to the question the night raises. A reader who has
 * just watched software resolve eighteen lines of a quotation overnight is
 * thinking "and what happens when it is wrong", and a page that answers that
 * five screens later has lost them. It is also the most persuasive section
 * here: everybody in this category claims capability, and very few will write
 * down in advance where their software is not allowed to go.
 *
 * ── Why §06 is where it is ─────────────────────────────────────────────────
 *
 * A commercial team asks what happens to their cost base before they ask what
 * the software does with it — but only once they have decided the software is
 * interesting, which is what the six sections above it are for. Answering it
 * earlier makes a reader defensive about a question they had not asked yet.
 */
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
      <Standing />
      <Access />
      <EarlyAccess />
    </>
  )
}
