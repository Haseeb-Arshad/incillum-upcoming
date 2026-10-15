import { Reveal } from '#/components/reveal.tsx'
import { glass, home, thread } from '#/content/site.ts'

/**
 * The handover — what is waiting on the desk at 08:04, laid over the morning.
 *
 * The photograph says where the night ended; this says what it ended with. It
 * is the caption of the morning plate, set the way the product would set it: a
 * person is back, there is one decision to make, and the two figures it turns
 * on. Like the documents, it is built rather than pictured, and it writes
 * nothing of its own. The person and the decision are the film's last frame,
 * the figures are the thread's 06:50 ledger, and the floor's word is the
 * matrix's. So the morning cannot disagree with the night that produced it.
 *
 * The shortfall is in the signal, because it is the figure that breaks the
 * floor. Nothing else in the card is.
 */

const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const margin = ledger.find((entry) => entry.term === home.matrix.summary.margin)
const floor = ledger.find((entry) => entry.term === 'Commercial floor')
const short = ledger.find((entry) => entry.breaches)

const morning = glass.film.frames[glass.film.frames.length - 1]
const person = morning?.chips.find((chip) => !chip.source)
/** The frame's line is the decision and then who makes it: two sentences, set as two things. */
const [decision = '', ...owner] = (morning?.line ?? '').split(/(?<=\.)\s+/)

export function GlassHandover() {
  return (
    <Reveal as="figcaption" className="glass-handover">
      {person ? (
        <span className="glass-chip" data-fresh="true">
          <span className="glass-chip-person" aria-hidden="true" />
          {person.text}
        </span>
      ) : null}
      <p className="glass-handover-decision">{decision}</p>
      <dl className="glass-handover-figures">
        <div>
          <dt>{margin?.term}</dt>
          <dd>
            {margin?.value}
            <span>
              {' '}
              · {home.matrix.summary.floor} {floor?.value}
            </span>
          </dd>
        </div>
        {short ? (
          <div className="glass-handover-short">
            <dt>{short.term}</dt>
            <dd>{short.value}</dd>
          </div>
        ) : null}
      </dl>
      <p className="glass-handover-owner">{owner.join(' ')}</p>
    </Reveal>
  )
}
