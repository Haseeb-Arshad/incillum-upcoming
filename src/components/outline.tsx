import { Container, DefinitionRows, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { outline } from '#/content/site.ts'

/**
 * What it will do, and how you direct it.
 *
 * ── Why it is five rows and not ten blocks ─────────────────────────────────
 *
 * It was two columns of five — capabilities on the left, interaction on the
 * right — and it was the place the page sagged. Ten entries of identical weight
 * is not a specification a reader works through, it is a wall a reader skims,
 * and the two columns made it worse rather than better: side by side they
 * invited a comparison that was not there, because *what it does* and *how you
 * talk to it* are not two halves of one thing.
 *
 * Five entries, full width, one per row. The five that survived carry the
 * argument end to end — it reads what actually arrives, it matches three ways,
 * it shows the working, it stops rather than guesses, and it is directed
 * through the inbox that already exists. The interaction lines were not deleted
 * so much as put where they belong: forwarding a thread and stating a rule once
 * *are* how you direct it, so they are the last row rather than a second
 * column.
 *
 * The full treatment of this material — five capabilities, each a paragraph
 * with a schematic drawing beside it, plus a section of its own on interaction
 * — is built and parked on `groundwork/full-capabilities`. It runs about five
 * screens and it belongs on the product site. It is not here because a
 * pre-launch page has one job, and a product tour in the middle of it competes
 * with the form rather than supporting it.
 *
 * ── The row shape, which is borrowed rather than invented ──────────────────
 *
 * Term left, description right, hairline between — the same shape `Standing`
 * uses. That is deliberate. This page has one editorial system, and inventing a
 * third arrangement for a third list is exactly how a page starts to read as
 * assembled from parts. `Scope` keeps the two-column form, because `Scope` is
 * genuinely a comparison and this is not.
 *
 * ── Placement ──────────────────────────────────────────────────────────────
 *
 * Before `Artifact`, which is before `Scope`. The specification says what the
 * operator is being built to do; the artifact shows what that produces; the
 * frame correction then lands on a reader holding something concrete. A reader
 * who has just seen the record is finally in a position to hear which of it a
 * chatbot could not have produced.
 */
export function Outline() {
  return (
    <section aria-labelledby="outline-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[52ch] flex-col gap-5">
          <Label>{outline.label}</Label>
          <h2 id="outline-heading" className="max-w-[18ch] text-title text-ink">
            {outline.headline}
          </h2>
          {/*
            This sentence puts every row below into the future tense, and it is
            the only thing licensing the system names inside them. The entries
            are then written in the plain present of a specification, which is
            far more readable than five separately hedged lines — but that only
            stays honest while this line is here. It is not decorative, and it
            is not a candidate for trimming.
          */}
          <p className="text-lede text-ink-600">{outline.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={outline.points} />
        </Reveal>
      </Container>
    </section>
  )
}
