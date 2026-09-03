import { Container, DefinitionRows, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { boundary } from '#/content/site.ts'

/**
 * Where it stops.
 *
 * ── The first section after the night ──────────────────────────────────────
 *
 * The page has just come back to paper, and this is what a reader lands on. It
 * is placed here because it is the answer to the question the night thread
 * raised: a reader who has watched software resolve eighteen lines of a
 * quotation overnight is not thinking "how impressive", they are thinking "and
 * what happens when it is wrong". Answering that six screens later loses the
 * reader who was going to ask it.
 *
 * ── Why it is four rows and not a comparison ───────────────────────────────
 *
 * The obvious layout is two columns — what it does against what it will not do
 * — and it is wrong here. A comparison invites a reader to weigh one side
 * against the other, and these four are not the losing half of anything. They
 * are the specification. Four full-width rows in the same shape the rest of the
 * page uses says that.
 *
 * The headline is three words on purpose. Everything else on this page is
 * arguing that the software is capable; this section's whole value is that it
 * is the one place saying, flatly and first, that it is bounded — and a hedged
 * version of that sentence would be worth nothing at all.
 */
export function Boundary() {
  return (
    <section aria-labelledby="boundary-heading" className="py-20 sm:py-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{boundary.label}</Label>
          <h2 id="boundary-heading" className="text-title text-ink">
            {boundary.headline}
          </h2>
          {/*
            "is being built to" is the tense contract for this section. Without
            it, four flat statements about what the software will not do read as
            a description of software that already refuses to do them.
          */}
          <p className="text-lede text-ink-600">{boundary.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={boundary.points} />
        </Reveal>
      </Container>
    </section>
  )
}
