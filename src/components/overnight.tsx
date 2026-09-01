import { Container, Label, Rule } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { instrument } from '#/content/site.ts'

/**
 * The shift the plate below is drawing.
 *
 * Three moments, each a real piece of finance operations work, each with the
 * hour it tends to arrive. The times are illustrations of when the work shows
 * up — not claims about anything the software has done, and the copy is written
 * so that distinction survives a skim.
 *
 * ── Why this runs before the plate, having once run after it ───────────────
 *
 * The original order put `Instrument` first, on the argument that these three
 * scenes were unreadable before a diagram had established what a night looks
 * like. In practice the reverse is true. This is the most concrete material on
 * the site — an invoice at 23:40, a payment run at 03:15, an unchased exception
 * at 06:50 — and it is the fastest route to a finance person recognising their
 * own week. Putting an abstract twenty-four hour rule in front of it spent the
 * page's most valuable scroll on a drawing nobody had a reason to read yet.
 *
 * So: three sentences of the night first, then the plate underneath proving the
 * proportion. Description, then evidence.
 *
 * Three columns at `lg` and a stack below it. The columns are separated by the
 * hairline that divides everything else on this page rather than by cards: a
 * card implies these are three things you could pick between, and they are
 * three parts of one night.
 */
export function Overnight() {
  return (
    <section aria-labelledby="overnight-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[44ch] flex-col gap-5">
          <Label>{instrument.label}</Label>
          <h2 id="overnight-heading" className="text-title text-ink">
            {instrument.headline}
          </h2>
          <p className="text-lede text-ink-600">{instrument.lede}</p>
        </Reveal>

        <Rule className="mt-12 sm:mt-16" />

        <ol className="grid lg:grid-cols-3">
          {instrument.shifts.map((shift, index) => (
            <Reveal
              as="li"
              delay={index * 60}
              key={shift.at}
              className="flex flex-col gap-3 border-b border-line py-8 lg:border-r lg:border-b-0 lg:pr-10 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-10"
            >
              <p className="ic-tabular text-label text-ink-400">{shift.at}</p>
              <h3 className="max-w-[26ch] text-heading text-ink">{shift.title}</h3>
              <p className="max-w-[44ch] text-body text-ink-600">{shift.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
