import { createFileRoute } from '@tanstack/react-router'

import { Access } from '#/components/access.tsx'
import { Artifact } from '#/components/artifact.tsx'
import { Direction } from '#/components/direction.tsx'
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
 *   ──  Masthead    who is asking                            ← __root.tsx
 *   01  Hero        the argument, who it is for, and the one thing asked for
 *   02  Overnight   three hours of a night, described
 *   03  Instrument  those hours drawn to scale, marked at your own clock
 *   04  Outline     what it is being built to do
 *   05  Direction   how you ask, and what comes back rather than gets decided
 *   06  Artifact    what that produces, set as a document
 *   07  Scope       what it is, and what it is deliberately not
 *   08  Standing    how far along the build actually is
 *   09  Access      what is decided about your data, and what is not
 *   ──  Colophon    the other door                           ← __root.tsx
 *
 * One argument, one conversion, no navigation. Everything a launched company's
 * site does well — a product tour, a demo, a qualification form — is the wrong
 * instrument at this moment, because the visitor has not yet accepted the
 * premise that an AI coworker for finance is a real category of thing. The page
 * has to win that first, and then ask for an email.
 *
 * ── The order, which is not arbitrary, and which changed ───────────────────
 *
 * §02 and §03 used to run the other way round, on the reasoning that the three
 * scenes were unreadable before the plate had drawn what a night looks like.
 * That was backwards. The scenes are the most concrete thing on the page and
 * the fastest way for a finance person to recognise their own Tuesday, and
 * making them wait behind an abstract diagram spent the visitor's most valuable
 * scroll on a drawing. Now the scenes state the night in three sentences and
 * the plate proves the proportion underneath them — description first, evidence
 * second, which is the order every other argument on this page runs in.
 *
 * §05 and §06 are the reason §04 could get shorter, and they are a pair: you
 * ask in a sentence, and a record comes back. §05 repairs something the cut
 * broke — direction had been a column of its own in §04 and ended up as a
 * clause at the end of the last row, which is burial rather than folding. §06
 * is the answer to both: a specification, however carefully written, asks the
 * reader to assemble the output in their own head, and showing it once is
 * cheaper and lands harder. Both sit before §07, because the frame correction
 * wants a reader holding something concrete to correct.
 *
 * §09 is last for the same reason it exists at all. A finance team asks what
 * happens to their data before they ask what the software does with it — but
 * only once they have decided the software is interesting, which is what the
 * eight sections above are for. Answering it earlier makes a reader defensive
 * about a question they had not asked yet.
 *
 * ── On length, which is the standing temptation here ───────────────────────
 *
 * §04 was ten lines and is five. The full version — five capabilities, each
 * with a schematic drawing, plus a section of its own on interaction — is built
 * and parked on `groundwork/full-capabilities` for the product site. It runs
 * five screens, and five screens of product tour in the middle of a pre-launch
 * page competes with the form rather than supporting it.
 *
 * That is the test for anything added here. Not "is this true and interesting"
 * — most of what could be added is — but "does a stranger need this before
 * deciding whether to leave an address". Almost nothing does. §05 is the rare
 * thing that passes it.
 */
export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <Overnight />
      <Instrument />
      <Outline />
      <Direction />
      <Artifact />
      <Scope />
      <Standing />
      <Access />
    </>
  )
}
