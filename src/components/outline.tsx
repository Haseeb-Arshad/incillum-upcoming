import { Container, DefinitionColumn, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { outline } from '#/content/site.ts'

/**
 * What it will do, and how you will direct it.
 *
 * ── Why it is this small ───────────────────────────────────────────────────
 *
 * The full treatment of this material — five capabilities, each a paragraph
 * with a schematic drawing beside it, plus a section of its own on interaction
 * — is built and parked on `groundwork/full-capabilities`. It runs to about
 * five screens and it belongs on the product site.
 *
 * It is not here because a pre-launch page has one job. A product tour in the
 * middle of it competes with the form rather than supporting it, and a visitor
 * who has to read five screens before deciding whether to leave an address
 * mostly just leaves. Ten lines is the amount of *idea* somebody needs to know
 * whether this is for them.
 *
 * ── Why it reuses the shape of the section after it ────────────────────────
 *
 * Both this and `Scope` are two labelled columns of term-and-description, from
 * the same `DefinitionColumn`. That repetition is deliberate rather than lazy:
 * this page has one editorial system, and a new arrangement invented for every
 * section is what makes a page feel assembled from parts. The two read
 * differently because they are asked different questions — this one is *what
 * and how*, the next is *and what it is not* — and the headings carry that.
 *
 * ── Placement ──────────────────────────────────────────────────────────────
 *
 * Before `Scope`, not after. A reader who has just been shown what something
 * does is finally in a position to hear which of it a chatbot could not have
 * done; the frame correction lands on an audience that has something concrete
 * to correct.
 */
export function Outline() {
  return (
    <section aria-labelledby="outline-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[42ch] flex-col gap-5">
          <Label>{outline.label}</Label>
          <h2 id="outline-heading" className="text-title text-ink">
            {outline.headline}
          </h2>
          {/*
            This sentence puts every line below into the future tense. The
            entries are then written in the plain present of a specification,
            which is far more readable than ten separately hedged lines — but
            that only stays honest while this line is here. It is not
            decorative, and it is not a candidate for trimming.
          */}
          <p className="text-lede text-ink-600">{outline.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 grid gap-x-16 gap-y-10 sm:mt-16 lg:grid-cols-2">
          <DefinitionColumn label={outline.does.label} points={outline.does.points} />
          <DefinitionColumn label={outline.working.label} points={outline.working.points} />
        </Reveal>
      </Container>
    </section>
  )
}
