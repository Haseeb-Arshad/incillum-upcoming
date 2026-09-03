import { Container, Label } from '#/components/primitives.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, hero } from '#/content/site.ts'

/**
 * The hero.
 *
 * ── The split ──────────────────────────────────────────────────────────────
 *
 * Statement and explanation on the left, the action on the right, both starting
 * from the same baseline. Side by side rather than stacked for a reason worth
 * stating: a headline set large enough to be a thesis takes a third of a laptop
 * screen on its own, and putting the form under it pushes the one control the
 * page exists to offer below the fold on every 13-inch display. This way all of
 * it is above the fold at 1280x800 and the eye finishes on the input.
 *
 * Seven columns to five, not six and six. The headline needs the width to break
 * where the sense breaks — after "leave" — and the form reads better at a
 * shorter measure anyway.
 *
 * ── The proof beat ─────────────────────────────────────────────────────────
 *
 * One hour and one modest claim, under a hairline at the bottom of the left
 * column. It is the quietest line in the hero and it does the most: the lede
 * above it is a thesis, and a thesis without a Tuesday attached to it is a
 * position paper. It is also the hook into the night thread, which opens at the
 * same minute — a reader who remembers 23:47 from up here recognises it four
 * screens down, and the page reads as one argument rather than as sections.
 *
 * The hour is set in the tabular figures and at full-strength ink while the
 * sentence around it stays muted, because the hour is the part that has to be
 * legible from the sentence's own periphery.
 *
 * ── No product image ───────────────────────────────────────────────────────
 *
 * The reflex here is a screenshot of the app. There is nothing shipped to
 * screenshot, and a mocked-up dashboard would be a picture of a product that
 * does not exist, presented as though it does. The image is one screen down,
 * where the page goes dark, and it is a drawing that says so.
 *
 * ── Motion ─────────────────────────────────────────────────────────────────
 *
 * One entrance, staggered across five elements over about a fifth of a second,
 * and nothing after it. It exists so the page assembles rather than appears,
 * not so anything is revealed: every element is in the server HTML and readable
 * without JavaScript. Opacity and a 10px translate, both composited, and
 * `prefers-reduced-motion` removes it entirely.
 */
export function Hero() {
  return (
    <section className="pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-28">
      <Container>
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Label className="ic-enter mb-6 sm:mb-8">{hero.eyebrow}</Label>

            {/*
              No `max-width`. The column itself is the measure — the display
              size in styles.css is derived from this column's width precisely
              so the line breaks after "leave" — and a `ch` cap on top of that
              would be a second, less accurate constraint fighting the first.
            */}
            <h1
              className="ic-enter text-display text-ink"
              style={{ ['--ic-enter-delay' as string]: '60ms' }}
            >
              {hero.headline}
            </h1>

            <p
              className="ic-enter mt-8 max-w-[52ch] text-quote text-ink-600 sm:mt-10"
              style={{ ['--ic-enter-delay' as string]: '130ms' }}
            >
              {hero.lede}
            </p>

            <div
              className="ic-enter mt-8 border-t border-line pt-5 sm:mt-10"
              style={{ ['--ic-enter-delay' as string]: '165ms' }}
            >
              <p className="max-w-[56ch] text-small text-ink-400">
                {/*
                  Two spans, from two fields, so the sentence carrying the hour
                  sits at full ink weight and the clause after it stays muted.
                  If the hour changes it changes in `thread` too — they are the
                  same minute of the same night, and the page depends on a
                  reader noticing that. There is a test.

                  Not `ic-tabular`. Tabular figures exist so numbers line up in
                  a column, and there is no column here — applied to a sentence
                  they only widen every digit against the letters around them,
                  which is the one thing this line cannot afford at 13px.
                */}
                <span className="text-ink">{hero.proof}</span> {hero.proofTail}
              </p>
            </div>
          </div>

          <div
            id="waitlist"
            className="ic-enter flex scroll-mt-28 flex-col gap-5 lg:col-span-5 lg:pt-2"
            style={{ ['--ic-enter-delay' as string]: '200ms' }}
          >
            {/*
              The column needs a name. Without one it opens on a bare "Work
              email" label, which reads as a form that fell out of a page rather
              than as an invitation.

              It names the thing (`early access`) while the button names the act
              (`join early access`), and the qualifier under it says who should
              be typing — the one line on the page whose job is to let the wrong
              reader stop reading.
            */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-heading text-ink">{brand.access}</h2>
              <p className="max-w-[46ch] text-small text-ink-400">{hero.qualifier}</p>
            </div>

            <WaitlistForm />

            {/*
              Under the button rather than beside the explanation. This sentence
              answers "what happens if I give you this address", and the moment
              that question gets asked is the moment a cursor is on the button.
            */}
            <p className="max-w-[46ch] text-small text-ink-400">{hero.assurance}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
