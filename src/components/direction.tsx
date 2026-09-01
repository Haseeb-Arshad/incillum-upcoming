import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { direction } from '#/content/site.ts'

/**
 * How you ask.
 *
 * ── What this is a translation of ──────────────────────────────────────────
 *
 * The reference for this section was a hero built out of floating cards — one
 * plain-English instruction per card, a row of vendor logos beneath each, the
 * whole set scattered around a radial graphic and fading at the edges. The idea
 * inside it is excellent. Almost none of the execution is available here, and
 * for two separate reasons that both matter.
 *
 * The first is the logos, and it is the serious one. See the comment on
 * `direction` in site.ts: that row of vendors is a claim about shipped
 * integrations, this site cannot make it, and a reader converts a logo grid
 * into "connected" faster than any sentence on the page can argue otherwise.
 * So what sits under each instruction here is what it *reads* — document types,
 * never products — and what it *hands back*. Reach inverted into restraint.
 *
 * The second is the drawing itself, and it is simply not this design system.
 * Cards on a page whose depth comes from hairlines and never from shadows;
 * blur and fade on a page with no gradient; a decorative spiral on a page whose
 * one picture is a clock; and a scatter animation on a motion budget already
 * fully spent — one hero entrance, one reveal per section, the clock, the arrow
 * and the press. Adopting the composition would mean rewriting AGENTS.md §4,
 * and §4 is most of why this page looks like it was made by someone with a
 * point of view.
 *
 * So the unit survives and the composition does not. Four instructions, set in
 * the serif at quote size because they are the only place on the site quoting
 * something a *reader* would say rather than something we are saying, on the
 * same hairline rows as every other list here.
 *
 * ── Placement ──────────────────────────────────────────────────────────────
 *
 * Between `Outline` and `Artifact`, which is the sequence the page now argues
 * in: what it is being built to do, how you ask it, what comes back. It also
 * repairs something the outline cut — direction used to be a column of its own
 * and got folded into a clause at the end of the last row, which was burial
 * rather than folding.
 *
 * The last instruction names Halstead, and the section below raises an
 * exception against Halstead. That is deliberate: the reader gives a standing
 * rule here and finds the held invoice waiting one screen later. Rename the
 * supplier in one place and it has to be renamed in both.
 */
export function Direction() {
  return (
    <section aria-labelledby="direction-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[52ch] flex-col gap-5">
          <Label>{direction.label}</Label>
          <h2 id="direction-heading" className="max-w-[20ch] text-title text-ink">
            {direction.headline}
          </h2>
          {/*
            "is being built to take" is the tense contract for this section, and
            it does the same job here that `outline.lede` does above it. Without
            it, four imperative sentences read as a description of software that
            answers to them today.
          */}
          <p className="text-lede text-ink-600">{direction.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 border-t border-line-strong sm:mt-16">
          <ol>
            {direction.instructions.map((instruction, index) => (
              <Reveal
                as="li"
                // Under the ~180ms total spread the reveal comment asks for;
                // past that a stagger stops reading as one movement and starts
                // reading as latency.
                delay={index * 45}
                key={instruction.say}
                className="grid gap-x-16 gap-y-5 border-b border-line py-8 lg:grid-cols-12 sm:py-10"
              >
                {/*
                  The instruction, in the serif and in quotation marks.

                  Marks rather than italics: this is the one place on the site
                  quoting words a *reader* would say rather than words the site
                  is saying, and the difference has to survive a skim. The serif
                  at quote size is the same treatment the drafted supplier email
                  gets in `Artifact` — both are speech, so both are set as
                  speech.
                */}
                <p className="max-w-[34ch] font-display text-quote text-ink lg:col-span-6">
                  “{instruction.say}”
                </p>

                {/*
                  What the reference put here was a row of vendor logos. What is
                  here instead is the evidence and the limit — the two things
                  this page can actually stand behind.
                */}
                <dl className="flex flex-col gap-4 lg:col-span-6">
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-label uppercase text-ink-400">
                      {direction.readsLabel}
                    </dt>
                    <dd className="max-w-[52ch] text-body text-ink-600">
                      {instruction.reads}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <dt className="text-label uppercase text-ink-400">
                      {direction.handsBackLabel}
                    </dt>
                    <dd className="max-w-[52ch] text-body text-ink-600">
                      {instruction.handsBack}
                    </dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  )
}
