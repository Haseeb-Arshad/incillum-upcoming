import { Container, Label } from '#/components/primitives.tsx'
import { figures } from '#/components/figures.tsx'
import { capabilities } from '#/content/site.ts'

/**
 * What it is being built to do.
 *
 * Five rows, each a drawing beside a paragraph, alternating side. It is the
 * arrangement every serious software company uses for this section, and it is
 * used here for the reason it exists rather than because it is familiar: a
 * capability is a claim, and a claim is more believable next to a picture of
 * the thing being claimed.
 *
 * ── What is different about doing it without a product ─────────────────────
 *
 * The usual version of this section is five product screenshots. There is
 * nothing shipped to photograph, so each row carries a schematic instead — see
 * the rule at the top of `figures.tsx`, which is the important file. A drawing
 * claims a design; a screenshot claims a product, and only one of those is
 * honest today.
 *
 * ── The limit line ─────────────────────────────────────────────────────────
 *
 * Every row ends with a sentence, set apart above a rule, saying where the
 * capability stops: the fields it will not infer, the batch it will not
 * release, the mail it will not send. They are separated visually rather than
 * folded into the paragraph because they are the half a controller is reading
 * for, and burying them mid-paragraph would look like burying them.
 *
 * ── Ordering ───────────────────────────────────────────────────────────────
 *
 * The order is the path a piece of work takes — it arrives, it is matched, it
 * lands in a schedule, it is written up, and it is talked about — not a ranking
 * by how impressive each part is. A reader who follows it once has the shape of
 * the whole product.
 *
 * ── Alternation ────────────────────────────────────────────────────────────
 *
 * The figure swaps sides on odd rows via `lg:order-*`, and only at `lg`. Below
 * that everything stacks in DOM order — text then drawing, every time — because
 * a figure that arrives before the sentence explaining it is a puzzle, and on a
 * phone there is no side for it to be on.
 */
export function Capabilities() {
  return (
    <section aria-labelledby="capabilities-heading" className="pb-8 sm:pb-12">
      <Container>
        <div className="flex max-w-[46ch] flex-col gap-5">
          <Label>{capabilities.label}</Label>
          <h2 id="capabilities-heading" className="text-title text-ink">
            {capabilities.headline}
          </h2>
          {/*
            This sentence puts every entry below into the future tense. The rows
            are then written in the plain present of a specification, which is
            far more readable than five separately hedged paragraphs — but that
            only stays honest while this line is here. It is not decorative.
          */}
          <p className="text-lede text-ink-600">{capabilities.lede}</p>
        </div>

        <ol className="mt-14 flex flex-col sm:mt-20">
          {capabilities.items.map((item, index) => {
            const Figure = figures[item.figure]
            const figureFirst = index % 2 === 1

            return (
              <li
                key={item.title}
                className="grid items-center gap-x-16 gap-y-8 border-t border-line py-12 lg:grid-cols-2 lg:py-16"
              >
                <div className={figureFirst ? 'lg:order-2' : undefined}>
                  <p className="ic-tabular mb-5 text-label text-ink-400">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="max-w-[20ch] text-title text-ink">{item.title}</h3>
                  <p className="mt-5 max-w-[52ch] text-lede text-ink-600">{item.body}</p>
                  <p className="mt-6 max-w-[52ch] border-t border-line pt-4 text-body text-ink-400">
                    {item.limit}
                  </p>
                </div>

                {/*
                  `aria-hidden`, and deliberately so. Every figure is a redrawing
                  of the paragraph beside it and adds no information a screen
                  reader is missing — so an alt text here would either repeat the
                  paragraph verbatim or describe rectangles. Neither is worth
                  making somebody listen to.
                */}
                <div
                  aria-hidden="true"
                  className={
                    figureFirst
                      ? 'lg:order-1 rounded-panel border border-line bg-paper-raised p-6 sm:p-10'
                      : 'rounded-panel border border-line bg-paper-raised p-6 sm:p-10'
                  }
                >
                  {Figure ? <Figure /> : null}
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
