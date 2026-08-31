import { Container, Label } from '#/components/primitives.tsx'
import { scope } from '#/content/site.ts'

/**
 * What it is, and what it is not.
 *
 * Everybody arrives at an "AI for finance" page with a chatbot already in their
 * head, and every sentence after that is heard through it. A feature list does
 * not dislodge that frame — it gets absorbed into it, and the reader leaves
 * thinking they have read about a smarter assistant. So the page spends a
 * section correcting the frame, and does it by putting the two readings side by
 * side where the difference is a glance rather than an inference.
 *
 * The right-hand column is the more important one and the harder one to write,
 * because every line in it is a capability given up in public: no chat window,
 * no autonomous approval of payments, no replatforming. A pre-launch page that
 * only lists what a product will do is indistinguishable from every other
 * pre-launch page. One that names its own limits before anyone asks is the only
 * kind a finance team has a reason to believe.
 *
 * Marked up as two `<dl>`s rather than two stacks of headings, because each
 * entry genuinely is a term and its description — which is what lets a screen
 * reader move through the six points as six pairs.
 */
function Column({
  label,
  points,
}: {
  label: string
  points: ReadonlyArray<{ title: string; body: string }>
}) {
  return (
    <div>
      <Label className="border-b border-line-strong pb-4">{label}</Label>

      <dl>
        {points.map((point) => (
          <div key={point.title} className="flex flex-col gap-2.5 border-b border-line py-7">
            <dt className="max-w-[26ch] text-heading text-ink">{point.title}</dt>
            <dd className="max-w-[48ch] text-body text-ink-600">{point.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function Scope() {
  return (
    <section aria-labelledby="scope-heading" className="pb-20 sm:pb-28">
      <Container>
        <div className="flex max-w-[40ch] flex-col gap-5">
          <Label>{scope.label}</Label>
          <h2 id="scope-heading" className="text-title text-ink">
            {scope.headline}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-16 gap-y-10 sm:mt-16 lg:grid-cols-2">
          <Column label={scope.is.label} points={scope.is.points} />
          <Column label={scope.isNot.label} points={scope.isNot.points} />
        </div>
      </Container>
    </section>
  )
}
