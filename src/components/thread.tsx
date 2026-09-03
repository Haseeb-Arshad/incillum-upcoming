import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { thread } from '#/content/site.ts'

/**
 * One night, one thread.
 *
 * The beats are typed in `content/site.ts` as `ThreadBeat` rather than inferred
 * from the literal, which is what lets `beat.state` and `beat.figures` be read
 * here as optional properties instead of narrowed out of a six-member union.
 *
 * ── The shape ──────────────────────────────────────────────────────────────
 *
 * Six beats down a single rule. The hour sits in the left track in tabular
 * figures and the beat in the right, hairline between — the same term-and-
 * description row the rest of the page divides with, because this site has one
 * editorial system and inventing a timeline widget for the one place a timeline
 * appears is how a page starts to read as assembled from parts.
 *
 * What makes it a night rather than a list is the rule running down the left of
 * the hours. It is continuous through every beat and it stops at the last one,
 * which is 08:04 — where the band itself ends and the page returns to paper.
 * That is the argument drawn in one line: something was attached to this the
 * whole time, and it hands over in the morning.
 *
 * ── The two special beats ──────────────────────────────────────────────────
 *
 * 01:18 carries a state chip — the only place in this section the signal colour
 * appears, and it is on the word `Needs review`, which is the beat where the
 * software stops. 06:50 carries a small ledger of figures, because a margin
 * under a floor is read in a glance when it is set as figures and argued with
 * when it is set as a sentence.
 *
 * Both are rendered from optional fields rather than from an index, so
 * re-ordering the beats or adding one cannot silently move the chip onto the
 * wrong hour.
 *
 * ── The label is the licence ───────────────────────────────────────────────
 *
 * `Illustrative · one request, one night` is the section's first line, in the
 * server's HTML, in the same type as every other section label. Not a watermark
 * across the figures, not a red banner, and not small print underneath. The
 * block is allowed to exist only while that line is above it, and `site.test.ts`
 * and the end-to-end suite both assert it.
 */
export function Thread() {
  return (
    <section aria-labelledby="thread-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{thread.label}</Label>
          <h2 id="thread-heading" className="max-w-[16ch] text-title text-ink">
            {thread.headline}
          </h2>
          {/*
            Says it is invented, in the first line, at reading size — the same
            standing this section's label has. A demonstration this specific
            earns its place only while both are above it.
          */}
          <p className="text-lede text-ink-600">{thread.lede}</p>
        </Reveal>

        <ol className="mt-12 sm:mt-16">
          {thread.beats.map((beat, index) => (
            <Reveal
              as="li"
              key={beat.at}
              delay={index * 45}
              className="grid gap-x-10 gap-y-4 border-t border-l-2 border-line border-l-line-strong py-8 pl-5 sm:grid-cols-12 sm:py-10 sm:pl-6"
            >
              {/*
                The hour.

                The rule beside it is the `li`'s own left border rather than the
                hour cell's, and that is the whole reason this reads as a thread
                instead of as a list. On the cell it is only as tall as one line
                of type, so six beats produce six short dashes with gaps between
                them — a dotted line down a section whose argument is that
                nothing was dropped. On the row it runs the full height of every
                beat, and consecutive rows abut, so it is one unbroken line from
                23:47 to 08:04 and it stops where the band does.
              */}
              <p className="ic-tabular text-label text-ink sm:col-span-2">{beat.at}</p>

              <div className="flex flex-col gap-3 sm:col-span-10">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h3 className="max-w-[36ch] text-heading text-ink">{beat.title}</h3>
                  {/*
                    The held state. Not a pill and not a dot: a word in the
                    signal colour behind a hairline, which is the same
                    treatment the shortfall gets in the evidence document —
                    both are the same event, which is work that stopped.
                  */}
                  {beat.state ? (
                    <span className="border border-signal/40 px-2 py-0.5 text-label uppercase text-signal">
                      {beat.state}
                    </span>
                  ) : null}
                </div>

                <p className="max-w-[68ch] text-body text-ink-600">{beat.body}</p>

                {/*
                  The ledger at 06:50.

                  A real `<dl>` at a fixed measure, not a table: four
                  term-and-value pairs are a description list, and a table with
                  two columns and no headings is a table that has lost its
                  meaning. The last row is the one figure in this band a person
                  is being asked to look at, so it carries the signal and the
                  rule above it — and nothing else in the ledger does.
                */}
                {beat.figures ? (
                  <dl className="mt-2 max-w-[34rem] border-t border-line">
                    {beat.figures.map((figure) => (
                      <div
                        key={figure.term}
                        className={
                          figure.breaches
                            ? 'flex items-baseline justify-between gap-6 border-t border-signal/40 py-3 text-signal'
                            : 'flex items-baseline justify-between gap-6 border-b border-line py-3'
                        }
                      >
                        <dt className={figure.breaches ? 'text-body' : 'text-body text-ink-600'}>
                          {figure.term}
                        </dt>
                        <dd className="ic-tabular text-body">{figure.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
