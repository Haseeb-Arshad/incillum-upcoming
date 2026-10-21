import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { standing } from '#/content/site.ts'

/**
 * Where the build stands.
 *
 * The band the reference pages fill with their largest numbers — professionals
 * using it, pages processed, assets under management. There are no such
 * numbers here, and inventing one is the failure this site is built against.
 * What a visitor actually asks after the pitch is *is anybody building this,
 * and how far along are they*, so the band answers that, at the size the
 * references give their figures: three states, present tense, no calendar.
 *
 * "Opening" is a state; "Q3" is a hostage. A date on a pre-launch page is a
 * promise made by whoever wrote it to whoever has to keep it, and it becomes a
 * lie on a fixed schedule.
 *
 * The numbering is real: the operator could not be built before the platform
 * under it, and access cannot open before the operator runs.
 */
export function Standing() {
  return (
    <section aria-labelledby="standing-title" className="standing">
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="standing-title" className="glass-heading">
            {standing.headline}
          </h2>
        </Reveal>

        <ol className="standing-stages">
          {standing.stages.map((stage, index) => (
            <Reveal as="li" delay={index * 60} key={stage.title} className="standing-stage">
              <p className="standing-number ic-tabular">{String(index + 1).padStart(2, '0')}</p>
              <p className="standing-state">{stage.state}</p>
              <h3 className="standing-stage-title">{stage.title}</h3>
              <p className="standing-stage-body">{stage.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
