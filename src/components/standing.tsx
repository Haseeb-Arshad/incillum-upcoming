import { Container, Label } from '#/components/primitives.tsx'
import { standing } from '#/content/site.ts'

/**
 * Where the build stands.
 *
 * The section a pre-launch page usually skips, and the reason most of them read
 * as a parked domain. A visitor's real question after the pitch is not *what
 * will it do* — the pitch answered that — it is *is anybody actually building
 * this, and how far along are they.* Leaving it unanswered does not make the
 * question go away; it means the reader answers it themselves, pessimistically.
 *
 * Three stages, present tense, and no calendar anywhere. A date on a pre-launch
 * page is a promise made by whoever wrote it to whoever has to keep it, and it
 * becomes a lie on a fixed schedule. "Opening" is a state; "Q3" is a hostage.
 *
 * The numbering is real: these are sequential, and the order carries
 * information the reader needs — the operator could not be built before the
 * platform under it, and the preview cannot open before the operator runs.
 * Nothing else on this site is numbered, because nothing else on it is a
 * sequence.
 */
export function Standing() {
  return (
    <section
      aria-labelledby="standing-heading"
      className="border-t border-line bg-paper-sunken py-20 sm:py-28"
    >
      <Container>
        <div className="flex max-w-[40ch] flex-col gap-5">
          <Label>{standing.label}</Label>
          <h2 id="standing-heading" className="text-title text-ink">
            {standing.headline}
          </h2>
        </div>

        <ol className="mt-12 border-t border-line-strong sm:mt-16">
          {standing.stages.map((stage, index) => (
            <li
              key={stage.title}
              className="grid gap-x-10 gap-y-3 border-b border-line py-8 sm:grid-cols-12"
            >
              <p className="ic-tabular text-label text-ink-400 sm:col-span-1">
                {String(index + 1).padStart(2, '0')}
              </p>

              <p className="text-label uppercase text-ink sm:col-span-2">{stage.state}</p>

              <h3 className="text-heading text-ink sm:col-span-4">{stage.title}</h3>

              <p className="text-body text-ink-600 sm:col-span-5">{stage.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
