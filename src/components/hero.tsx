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
 * where the sense breaks — after "doesn't" — and the form reads better at a
 * shorter measure anyway.
 *
 * The lede sits under the headline rather than beside it, which is the second
 * arrangement of this section rather than the first. Beside it, the left column
 * ran about three hundred pixels shorter than the form and the hero had a
 * visible hole in its bottom-left corner. Moving one paragraph closes the gap
 * and improves the reading order at the same time: statement, then explanation,
 * then — in the other column — the thing being asked for.
 *
 * ── No product image ───────────────────────────────────────────────────────
 *
 * The reflex here is a screenshot of the app. There is nothing shipped to
 * screenshot, and a mocked-up dashboard would be a picture of a product that
 * does not exist, presented as though it does. The one picture on this site is
 * the section below, and it is a drawing of a clock — which is true.
 *
 * ── Motion ─────────────────────────────────────────────────────────────────
 *
 * One entrance, staggered across four elements over about a quarter of a
 * second, and nothing after it. It exists so the page assembles rather than
 * appears, not so anything is revealed: every element is in the server HTML and
 * readable without JavaScript. Opacity and a 10px translate, both composited,
 * and `prefers-reduced-motion` removes it entirely.
 */
export function Hero() {
  return (
    <section className="pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-28">
      <Container>
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Label className="ic-enter mb-6 sm:mb-8">{hero.eyebrow}</Label>

            {/*
              No `max-width`. The column itself is the measure — the display
              size in styles.css is derived from this column's width precisely
              so the line breaks after "doesn't" — and a `ch` cap on top of that
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
          </div>

          <div
            id="waitlist"
            className="ic-enter flex scroll-mt-24 flex-col gap-6 lg:col-span-5 lg:pt-2"
            style={{ ['--ic-enter-delay' as string]: '200ms' }}
          >
            {/*
              The column needs a name. Without one it opens on a bare "Work
              email" label, which reads as a form that fell out of a page rather
              than as an invitation.

              It names the thing (`early access`) while the button names the
              act (`join the waitlist`), so the two are never two verbs for one
              action. The success state uses the same two words for the same two
              jobs.
            */}
            <h2 className="text-heading text-ink">{brand.access}</h2>

            <WaitlistForm />

            {/*
              Under the button rather than beside the explanation. This sentence
              answers "what happens if I give you this address", and the moment
              that question gets asked is the moment a cursor is on the button.
              Placed next to the prose it is read before the question exists and
              forgotten by the time it does.
            */}
            <p className="max-w-[44ch] text-small text-ink-400">{hero.assurance}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
