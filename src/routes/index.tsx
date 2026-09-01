import { createFileRoute } from '@tanstack/react-router'

import { Artifact } from '#/components/artifact.tsx'
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
 *   04  Outline     what it is being built to do, and how you direct it
 *   05  Artifact    what that produces, set as a document
 *   06  Scope       what it is, and what it is deliberately not
 *   07  Standing    how far along the build actually is
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
 * §05 is new and it is the reason §04 could get shorter. A specification, however
 * carefully written, asks the reader to assemble the output in their own head;
 * showing it once is cheaper and lands harder. It sits after §04 because it is
 * the answer to §04, and before §06 because the frame correction wants a reader
 * holding something concrete to correct.
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
      <Artifact />
      <Scope />
      <Standing />
    </>
  )
}
