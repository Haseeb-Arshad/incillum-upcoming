import { Container, Label } from '#/components/primitives.tsx'
import { working } from '#/content/site.ts'

/**
 * How you work with it.
 *
 * ── Why this section exists, and why it is here ────────────────────────────
 *
 * It answers the question the section before it provokes. Once a reader has
 * accepted that this is not a chat window, their very next thought is *then how
 * do I tell it anything* — and a page that raises that and moves on sounds
 * evasive rather than principled. So the frame correction is immediately
 * followed by the answer.
 *
 * ── The shape ──────────────────────────────────────────────────────────────
 *
 * Five short entries in two columns, not five more full-width rows. This runs
 * about five screens into the page, after the capability section has asked for
 * real reading, and by here a visitor is scanning. Anything that looks like
 * another long row gets skipped — so the entries are short enough to take in at
 * a glance and laid out to be swept rather than read.
 *
 * The first entry carries the only sentence in quotation marks anywhere on the
 * site. It is an example of what somebody would type, and it earns the
 * exception because showing one real instruction settles "what does talking to
 * it actually look like" faster than a paragraph about natural language.
 */
export function Working() {
  return (
    <section aria-labelledby="working-heading" className="pb-20 sm:pb-28">
      <Container>
        <div className="flex max-w-[40ch] flex-col gap-5">
          <Label>{working.label}</Label>
          <h2 id="working-heading" className="text-title text-ink">
            {working.headline}
          </h2>
        </div>

        <dl className="mt-12 grid gap-x-16 border-t border-line sm:mt-16 lg:grid-cols-2">
          {working.points.map((point) => (
            <div key={point.title} className="border-b border-line py-7">
              <dt className="text-heading text-ink">{point.title}</dt>
              <dd className="mt-2.5 max-w-[46ch] text-body text-ink-600">{point.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
