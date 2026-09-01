import { Container, Label, Rule } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { artifact } from '#/content/site.ts'

/**
 * One artifact — the record a person picks up at 09:00.
 *
 * ── Why this is allowed to exist on a page with no screenshots ─────────────
 *
 * `Hero` and `Instrument` both say, at length, that there is nothing shipped to
 * photograph and that a rendered dashboard presented as a product would be a
 * lie told in pixels. That rule is intact and this does not bend it.
 *
 * The distinction is between a picture of an *interface* and a picture of a
 * *deliverable*. There is no chrome here, no sidebar, no window, no button, no
 * cursor, no fake avatar, nothing that could be screenshotted out of context
 * and mistaken for a running application. It is set as a document, in the
 * page's own two typefaces, on the page's own hairlines — closer to a printed
 * case sheet than to software. And the first line of the section says it is
 * invented, in the same size as everything else, rather than in a disclaimer
 * underneath where nobody reads it.
 *
 * ── Why the page needs it at all ───────────────────────────────────────────
 *
 * `Outline` is five abstractions. A controller reading them has to assemble
 * this record in their own head to know whether any of it is worth having, and
 * most will not bother. Showing the output once costs a screen and does more
 * work than the five rows above it: the discrepancy named in a sentence, the
 * supplier already asked, the evidence already attached, and — the line the
 * whole page has been making — nothing posted and no money moved.
 *
 * ── Drawn with contrast, because there is no red ───────────────────────────
 *
 * The failing row of a three-way match is the one thing in this block a reader
 * must not miss, and every convention for marking it reaches for colour this
 * design does not have. So it is marked the only way left: the two rows that
 * agree are set in `ink-600`, the row that broke is set in full `ink` with a
 * strengthened rule under it. That is the same trick the rest of the site uses
 * for emphasis, spent here on the one place it is worth spending.
 *
 * ── The table at 390px ─────────────────────────────────────────────────────
 *
 * It started as four columns and it did not fit. The three ways out of that
 * were a sideways scroll, a stacked row, and one column fewer, and the first
 * two are both worse than they look: a horizontal scroll hides evidence inside
 * the one block on the page whose whole argument is that no evidence is hidden,
 * and stacking means either abandoning the table element or rendering the same
 * figures twice and hiding one copy.
 *
 * So the unit price came out — it is stated in the sentence below, where the
 * arithmetic that matters actually lives — and what is left is three columns
 * that fit a phone as a plain table with no responsive machinery at all. There
 * is an end-to-end test asserting the page has no horizontal overflow, and this
 * is the section most likely to break it.
 */
export function Artifact() {
  const record = artifact.record

  return (
    <section aria-labelledby="artifact-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[56ch] flex-col gap-5">
          <Label>{artifact.label}</Label>
          <h2 id="artifact-heading" className="max-w-[18ch] text-title text-ink">
            {artifact.headline}
          </h2>
          {/*
            Says it is invented, in the first line, at reading size. A block
            like this earns its place only while that sentence is above it — put
            the admission in small print under the panel and this stops being an
            illustration and starts being a mock-up passed off as a product.
          */}
          <p className="text-lede text-ink-600">{artifact.lede}</p>
        </Reveal>

        <Reveal
          delay={80}
          className="mt-12 rounded-panel border border-line bg-paper-raised px-6 py-8 sm:mt-16 sm:px-10 sm:py-10"
        >
          {/* ── The case header ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <p className="ic-tabular text-label uppercase text-ink-400">
              {record.reference} · {record.raisedLabel} {record.raisedAt}
            </p>
            {/*
              The state, in full-strength ink against the muted reference
              beside it. Not a pill, not a badge, not a dot — this page has one
              emphasis and it is contrast.
            */}
            <p className="text-label uppercase text-ink">{record.state}</p>
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <h3 className="text-heading text-ink">{record.supplier}</h3>
            <p className="ic-tabular text-body text-ink-600">{record.document}</p>
          </div>

          {/* ── The three-way match ──────────────────────────────────────── */}
          <div className="mt-10">
            <Label className="border-b border-line-strong pb-3">
              {record.matchLabel}
            </Label>

            {/*
              A real `<table>` with three real `<td>`s per row. Three sources
              against two figures is tabular data, and a stack of divs would
              take the row-and-column relationship away from a screen reader for
              no visual gain at all.

              The header row is `sr-only` rather than absent: sighted readers
              have "Three-way match" above and three unambiguous source names
              down the side, so column headings would be furniture — but a
              screen reader announcing "Goods receipt, 450 units" with no idea
              what 450 counts is a table that has lost its meaning.

              Three columns fit at 390px; four did not. See `matchColumns` in
              site.ts for what came out and where it went.
            */}
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="sr-only">
                <tr>
                  <th scope="col">{record.matchColumns.source}</th>
                  <th scope="col">{record.matchColumns.quantity}</th>
                  <th scope="col">{record.matchColumns.total}</th>
                </tr>
              </thead>
              <tbody>
                {record.matchRows.map((row) => (
                  <tr
                    key={row.source}
                    className={
                      row.agrees
                        ? 'border-b border-line text-ink-600'
                        : 'border-b border-line-strong text-ink'
                    }
                  >
                    <th
                      scope="row"
                      className="w-[42%] py-4 pr-3 text-body font-normal sm:w-1/2"
                    >
                      {row.source}
                    </th>
                    <td className="ic-tabular w-[27%] py-4 pr-3 text-body sm:w-1/4">
                      {row.quantity}
                    </td>
                    <td className="ic-tabular w-[31%] py-4 text-right text-body sm:w-1/4">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── What broke ───────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-2.5">
            <Label>{record.discrepancy.label}</Label>
            <p className="max-w-[62ch] text-lede text-ink">{record.discrepancy.body}</p>
          </div>

          <Rule className="mt-8" />

          {/* ── What it did, and what it sent ────────────────────────────── */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-4">
              <Label>{record.done.label}</Label>
              <ul className="flex flex-col gap-3">
                {record.done.points.map((point) => (
                  <li key={point} className="max-w-[52ch] text-body text-ink-600">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Label>{record.draft.label}</Label>
              {/*
                Set in the serif behind a rule, the way a pull quote is. It is
                the only place on the site quoting text the software wrote, and
                a reader should be able to tell that at a glance without a
                screenshot of a mail client around it.
              */}
              <blockquote className="border-l border-line-strong pl-5">
                <p className="max-w-[52ch] font-display text-quote text-ink">
                  {record.draft.body}
                </p>
              </blockquote>
            </div>
          </div>

          <Rule className="mt-8" />

          {/* ── The decision that is still a person's ────────────────────── */}
          <div className="mt-8 flex flex-col gap-2.5">
            <Label>{record.decision.label}</Label>
            <p className="max-w-[62ch] text-lede text-ink">{record.decision.body}</p>
          </div>

          {/* ── The evidence ─────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
            <Label>{record.evidence.label}</Label>
            {/*
              Plain text, not links. Nothing here resolves to anything, and a
              row of underlined filenames that do nothing when clicked is the
              one detail that would make this read as a broken interface rather
              than as an illustration.
            */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {record.evidence.items.map((item) => (
                <li key={item} className="text-small text-ink-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
