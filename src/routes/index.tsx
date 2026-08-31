import { createFileRoute } from '@tanstack/react-router'

import { Capabilities } from '#/components/capabilities.tsx'
import { Hero } from '#/components/hero.tsx'
import { Instrument } from '#/components/instrument.tsx'
import { Overnight } from '#/components/overnight.tsx'
import { Scope } from '#/components/scope.tsx'
import { Standing } from '#/components/standing.tsx'
import { Working } from '#/components/working.tsx'

/**
 * incillum.com — an AI coworker for finance operations, before there is a
 * product to show.
 *
 *   ──  Masthead      who is asking, what stage this is      ← __root.tsx
 *   01  Hero          the argument, and the one thing asked for
 *   02  Instrument    a working day drawn to scale, marked at your clock
 *   03  Overnight     the shift the plate above is drawing
 *   04  Capabilities  what it is being built to do, in five parts
 *   05  Scope         what it is, and what it is deliberately not
 *   06  Working       how you actually talk to it
 *   07  Standing      how far along the build actually is
 *   ──  Colophon      the other door                         ← __root.tsx
 *
 * One argument, one conversion, no navigation. Everything a launched company's
 * site does well — a product tour, a demo, a qualification form — is the wrong
 * instrument at this moment, because the visitor has not yet accepted the
 * premise that an AI coworker for finance is a real category of thing. The page
 * has to win that first, and then ask for an email.
 *
 * ── The order, which is not arbitrary ──────────────────────────────────────
 *
 * Each section depends on the one before it. §03 is unreadable before §02 has
 * drawn what a night looks like. §04 only lands once somebody believes there is
 * work happening at 03:15. §05 corrects the frame *after* the capabilities,
 * because a reader who has just been shown five things a product does is
 * finally in a position to hear which of them a chatbot could not have done.
 * §06 exists because §05 provokes it: tell somebody this is not a chat window
 * and their next thought is how they are supposed to talk to it, so the answer
 * follows immediately rather than being left as an implication.
 *
 * ── On length ──────────────────────────────────────────────────────────────
 *
 * This is now about seven screens, which is long for a page with no product,
 * and the discipline that keeps it from becoming a brochure is that every
 * section is answering a question the previous one raised. When something is
 * added here, that is the test: not "is this true and interesting" — most of
 * what could be added is — but "which question that the reader already has does
 * this answer". Nothing gets a section for being impressive.
 */
export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <Instrument />
      <Overnight />
      <Capabilities />
      <Scope />
      <Working />
      <Standing />
    </>
  )
}
