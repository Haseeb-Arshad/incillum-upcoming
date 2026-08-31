import { Container, Label, Rule } from '#/components/primitives.tsx'
import { instrument } from '#/content/site.ts'

/**
 * The shift the plate above is drawing.
 *
 * Three moments, each a real piece of finance operations work, each with the
 * hour it tends to arrive. The times are illustrations of when the work shows
 * up — not claims about anything the software has done, and the copy is written
 * so that distinction survives a skim.
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
        <div className="flex max-w-[44ch] flex-col gap-5">
          <Label>{instrument.label}</Label>
          <h2 id="overnight-heading" className="text-title text-ink">
            {instrument.headline}
          </h2>
          <p className="text-lede text-ink-600">{instrument.lede}</p>
        </div>

        <Rule className="mt-12 sm:mt-16" />

        <ol className="grid lg:grid-cols-3">
          {instrument.shifts.map((shift) => (
            <li
              key={shift.at}
              className="flex flex-col gap-3 border-b border-line py-8 lg:border-r lg:border-b-0 lg:pr-10 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-10"
            >
              <p className="ic-tabular text-label text-ink-400">{shift.at}</p>
              <h3 className="max-w-[26ch] text-heading text-ink">{shift.title}</h3>
              <p className="max-w-[44ch] text-body text-ink-600">{shift.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
