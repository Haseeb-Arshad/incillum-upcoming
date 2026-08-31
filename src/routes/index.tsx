import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '#/components/hero.tsx'
import { Instrument } from '#/components/instrument.tsx'
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
 *   04  Scope       what it is, and what it is deliberately not
 *   05  Standing    how far along the build actually is
 *   ──  Colophon    the other door                           ← __root.tsx
 *
 * One argument, one conversion, no navigation. Everything a launched company's
 * site does well — capability pages, a demo, a qualification form — is the
 * wrong instrument at this moment, because the visitor has not yet accepted the
 * premise that an AI coworker for finance is a real category of thing. The page
 * has to win that first, and then ask for an email.
 *
 * The order is fixed and each section depends on the one before it. §03 is
 * unreadable before §02 has drawn what a night looks like, and §04 only lands
 * once somebody believes there is work happening at 03:15.
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
      <Scope />
      <Standing />
    </>
  )
}
