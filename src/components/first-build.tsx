import { Container, DefinitionRows, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { firstBuild } from '#/content/site.ts'

/**
 * What is being built first.
 *
 * ── The narrowest section on the site, deliberately ────────────────────────
 *
 * Three rows: what arrives, what happens to it, what comes back. That is the
 * whole product statement, and the temptation to add a fourth is the standing
 * one here — there is always another true and interesting capability, and a
 * page that names six of them has named none, because a reader remembers a
 * wedge and skims a catalogue.
 *
 * The test for anything added to this section is not "is it true" but "does a
 * stranger need it before deciding whether to leave an address". Almost nothing
 * does. The hero's lede already says what the company is eventually for; this
 * says what it is doing first, and the difference between those two sentences
 * is the difference between a vision and a plan.
 *
 * ── Why it runs after the evidence and not before it ───────────────────────
 *
 * Because it is the only abstract section left on the page, and an abstraction
 * lands when a reader already has something concrete to hang it on. By the time
 * anybody reaches this they have watched one quotation move through a night and
 * seen one line of it taken apart. "RFQ to commercial decision" is then a name
 * for something they have already seen, rather than a category to be persuaded
 * of.
 */
export function FirstBuild() {
  return (
    <section aria-labelledby="first-build-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{firstBuild.label}</Label>
          <h2 id="first-build-heading" className="max-w-[16ch] text-title text-ink">
            {firstBuild.headline}
          </h2>
          <p className="text-lede text-ink-600">{firstBuild.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={firstBuild.points} />
        </Reveal>
      </Container>
    </section>
  )
}
