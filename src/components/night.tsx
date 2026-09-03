import { Container, Label } from '#/components/primitives.tsx'
import { Instrument } from '#/components/instrument.tsx'
import { Nightfall } from '#/components/nightfall.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { Thread } from '#/components/thread.tsx'
import { instrument } from '#/content/site.ts'

/**
 * The night.
 *
 * ── What this component is for ─────────────────────────────────────────────
 *
 * It is one band, and it is the design idea the whole site turns on: the page
 * goes dark where the office empties and comes back to paper where a person
 * returns to their desk. A reader scrolls into the night at the top of this
 * component and out of it at 08:04, which is the last beat of the thread.
 *
 * Every alternative was a section with a dark card in it. This is not that. The
 * band runs full bleed, edge to edge, for four screens, and it is the only
 * thing on the site that changes the colour of the ground you are standing on
 * — which is what makes it read as a time of day rather than as an accent.
 *
 * ── Why the inverted scope is still "used once" ────────────────────────────
 *
 * The design rules say the dark region re-points the same tokens and is used
 * once. Both still hold. There is exactly one `data-inverted` element on the
 * page; it simply contains three sections now instead of one panel. Nothing
 * inside it knows it is dark — the plate, the instrument and the thread are all
 * written against `text-ink` and `border-line` like everything else, and they
 * would render correctly on paper if this wrapper were removed.
 *
 * ── The seams ──────────────────────────────────────────────────────────────
 *
 * No border at the top or the bottom. A hairline between paper and near-black
 * is a line drawn on a boundary that is already the strongest edge on the page,
 * and it reads as a mistake. The transition is the colour change and nothing
 * else.
 *
 * The masthead is `bg-paper` and sticky, so it stays light while this band
 * scrolls under it. That was checked rather than assumed: a translucent
 * masthead would have shown the night through it, and a masthead that inverted
 * with the band would be a header that changes colour twice per visit.
 */
export function Night() {
  return (
    <div data-inverted="" className="py-20 sm:py-28">
      {/*
        The section heading sits above the plate rather than beside it. The
        drawing is the argument and the heading names it; putting the words next
        to the image would make them a caption, and this sentence is a thesis.
      */}
      <section aria-labelledby="night-heading" className="pb-14 sm:pb-20">
        <Container>
          <Reveal className="flex max-w-[46ch] flex-col gap-5">
            <Label>{instrument.label}</Label>
            <h2 id="night-heading" className="text-title text-ink">
              {instrument.headline}
            </h2>
            <p className="text-lede text-ink-600">{instrument.lede}</p>
          </Reveal>
        </Container>
      </section>

      {/*
        The plate is not wrapped in a `Reveal`.

        Everything else on this page fades up as it arrives, and this is the one
        element where that would be wrong twice over: it is the largest object
        on the site, so a 10px translate on it reads as the page slipping rather
        than settling — and it is a picture of a room where nothing is
        happening, which is not an argument that survives being animated into
        view.
      */}
      <div className="pb-16 sm:pb-24">
        <Nightfall />
      </div>

      <Instrument />
      <Thread />
    </div>
  )
}
