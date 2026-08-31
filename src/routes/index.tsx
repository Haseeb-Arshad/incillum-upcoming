import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '#/components/hero.tsx'
import { Instrument } from '#/components/instrument.tsx'
import { Outline } from '#/components/outline.tsx'
import { Overnight } from '#/components/overnight.tsx'
import { Scope } from '#/components/scope.tsx'
import { Standing } from '#/components/standing.tsx'

/**
 * incillum.com — an AI coworker for finance operations, before there is a
 * product to show.
 *
 *   ──  Masthead    who is asking, what stage this is        ← __root.tsx
 *   01  Hero        the argument, and the one thing asked for
 *   02  Instrument  a working day drawn to scale, marked at your clock
 *   03  Overnight   the shift the plate above is drawing
 *   04  Outline     what it will do, and how you will direct it
 *   05  Scope       what it is, and what it is deliberately not
 *   06  Standing    how far along the build actually is
 *   ──  Colophon    the other door                           ← __root.tsx
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
 * work happening at 03:15. §05 corrects the frame *after* §04, because a reader
 * who has just been shown what something does is finally in a position to hear
 * which of it a chatbot could not have done.
 *
 * ── On length, which is the standing temptation here ───────────────────────
 *
 * §04 is ten lines. The full version of it — five capabilities, each with a
 * schematic drawing, plus a section of its own on interaction — is built and
 * parked on `groundwork/full-capabilities` for the product site. It runs five
 * screens, and five screens of product tour in the middle of a pre-launch page
 * competes with the form rather than supporting it.
 *
 * That is the test for anything added here. Not "is this true and interesting"
 * — most of what could be added is — but "does a stranger need this before
 * deciding whether to leave an address". Almost nothing does.
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
      <Outline />
      <Scope />
      <Standing />
    </>
  )
}
