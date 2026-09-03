import { Container, Label, Rule } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { evidence } from '#/content/site.ts'

/**
 * The evidence document.
 *
 * ── Why a document is allowed here, when a screenshot is not ───────────────
 *
 * The rule this page holds to is that there is nothing shipped to photograph,
 * and a rendered dashboard presented as a product would be a lie told in
 * pixels. That rule is intact. This is not a picture of an interface: there is
 * no chrome, no sidebar, no button, no cursor, nothing that could be mistaken
 * for a running application — and the block says what it is in its own first
 * line, in the same type as everything around it.
 *
 * What it is instead is one line of a quotation with its provenance attached,
 * set as a commercial document. That is the specific claim this company makes —
 * not that the number appears, but that the number arrives carrying the page it
 * came from — and it is the one thing four paragraphs of specification cannot
 * make concrete.
 *
 * ── The four movements ─────────────────────────────────────────────────────
 *
 * Source, finding, calculation, decision, in that order, because that is the
 * order a person checks a number in: where did this come from, what changed,
 * show me the arithmetic, what do you want from me. Each is a labelled band
 * separated by the page's own hairline rather than a card, because they are
 * four parts of one record and cards would say they are four records.
 *
 * ── The arithmetic ────────────────────────────────────────────────────────
 *
 * Exact, checked in `content/site.test.ts`, and reconciling with the quotation
 * total the night thread prints at 06:50. See the note on `evidence` in
 * `content/site.ts` for the full working. If one figure here is edited, the
 * test names the others that have to move with it.
 *
 * ── Where the one colour goes ─────────────────────────────────────────────
 *
 * The shortfall row, and nothing else in this section. It is the number that
 * stopped the work and the only thing in the document a person is being asked
 * to look at — the same event, and therefore the same colour, as the held line
 * in the night thread. Giving it a red of its own would say the two are
 * different kinds of trouble.
 */
export function Evidence() {
  const record = evidence.record

  return (
    <section aria-labelledby="evidence-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[56ch] flex-col gap-5">
          <Label>{evidence.label}</Label>
          <h2 id="evidence-heading" className="max-w-[20ch] text-title text-ink">
            {evidence.headline}
          </h2>
          {/*
            Says it is invented, in the first line, at reading size. A block
            like this earns its place only while that sentence is above it — put
            the admission in small print under the panel and this stops being an
            illustration and starts being a mock-up passed off as a product.
          */}
          <p className="text-lede text-ink-600">{evidence.lede}</p>
        </Reveal>

        <Reveal
          delay={80}
          className="mt-12 rounded-panel border border-line bg-paper-raised px-6 py-8 sm:mt-16 sm:px-10 sm:py-10"
        >
          {/* ── The line this document is about ──────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <p className="ic-tabular text-label uppercase text-ink-400">{record.reference}</p>
            <p className="ic-tabular text-label uppercase text-ink">
              {record.revisedLabel} {record.revisedAt}
            </p>
          </div>

          <h3 className="mt-6 text-heading text-ink">{record.part}</h3>

          {/* ── Source ───────────────────────────────────────────────────── */}
          <div className="mt-10 flex flex-col gap-4">
            <Label className="border-b border-line-strong pb-3">
              {record.source.label}
            </Label>
            <p className="max-w-[52ch] text-body text-ink-600">{record.source.lede}</p>
            {/*
              A real `<dl>`: each entry is a document and what was taken from
              it, which is a term and its description. Marking it up that way is
              what lets a screen reader move through the pairs as pairs — and
              this is the one section on the site where the pairing *is* the
              content.
            */}
            <dl className="mt-1 border-t border-line">
              {record.source.items.map((item) => (
                <div
                  key={item.term}
                  className="grid gap-x-10 gap-y-1 border-b border-line py-4 sm:grid-cols-12"
                >
                  <dt className="text-body text-ink sm:col-span-4">{item.term}</dt>
                  <dd className="max-w-[56ch] text-body text-ink-600 sm:col-span-8">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Rule className="mt-8" />

          {/* ── Finding ──────────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-2.5">
            <Label>{record.finding.label}</Label>
            <p className="max-w-[64ch] text-lede text-ink">{record.finding.body}</p>
          </div>

          <Rule className="mt-8" />

          {/* ── Calculation ──────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-4">
            <Label>{record.calculation.label}</Label>
            {/*
              A real `<table>`. Bases against a working and an amount is
              tabular data, and a stack of divs would take the row-and-column
              relationship away from a screen reader for no visual gain.

              The header row is `sr-only` rather than absent: a sighted reader
              has "Calculation" above and unambiguous bases down the side, so
              column headings would be furniture — but a screen reader
              announcing "Margin, 15.2%, EUR 29,184.00" with no idea which
              number is the working and which is the amount has a table that has
              lost its meaning.

              ── Three columns, and what happens at 390px ──────────────────

              They do not fit. `1,200 × EUR 135.68` in a third of 294 pixels
              wraps onto three lines, and so does the amount beside it, which
              turns the one block on this page whose job is to be checkable into
              a column of fragments.

              A horizontal scroller was the obvious answer and it is the wrong
              one here: this section's entire argument is that nothing is
              hidden, and hiding the arithmetic off the right-hand edge of it is
              a joke at the reader's expense.

              So the working folds under its own basis below `sm`, and the
              column — heading included — is `display: none` at that width
              rather than merely invisible. That matters: a hidden cell is not
              announced, so the table stays two-by-two for assistive technology
              instead of promising three columns and delivering two. The reading
              becomes "Cost, 1,200 × EUR 135.68 — EUR 162,816.00", which is the
              sentence the row means anyway.
            */}
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="sr-only">
                <tr>
                  <th scope="col">{record.calculation.columns.basis}</th>
                  <th scope="col" className="hidden sm:table-cell">
                    {record.calculation.columns.working}
                  </th>
                  <th scope="col">{record.calculation.columns.amount}</th>
                </tr>
              </thead>
              <tbody>
                {record.calculation.rows.map((row) => (
                  <tr key={row.basis} className="border-b border-line text-ink-600">
                    <th
                      scope="row"
                      className="w-[56%] py-4 pr-3 align-top text-body font-normal sm:w-[34%]"
                    >
                      {row.basis}
                      <span className="ic-tabular mt-1 block text-small text-ink-400 sm:hidden">
                        {row.working}
                      </span>
                    </th>
                    <td className="ic-tabular hidden py-4 pr-3 align-top text-body sm:table-cell sm:w-[33%]">
                      {row.working}
                    </td>
                    <td className="ic-tabular w-[44%] py-4 text-right align-top text-body sm:w-[33%]">
                      {row.amount}
                    </td>
                  </tr>
                ))}
                {/*
                  The shortfall, in the site's one colour, under a rule of the
                  same colour. It is a row of the same table rather than a
                  callout beneath it because it is arithmetic — the last line of
                  the sum, and the only one anybody will read twice.
                */}
                <tr className="border-t-2 border-signal/50 text-signal">
                  <th scope="row" className="py-4 pr-3 align-top text-body font-normal">
                    {record.calculation.shortfall.basis}
                    <span className="ic-tabular mt-1 block text-small sm:hidden">
                      {record.calculation.shortfall.working}
                    </span>
                  </th>
                  <td className="ic-tabular hidden py-4 pr-3 align-top text-body sm:table-cell">
                    {record.calculation.shortfall.working}
                  </td>
                  <td className="ic-tabular py-4 text-right align-top text-body">
                    {record.calculation.shortfall.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Rule className="mt-8" />

          {/* ── The decision that is still a person's ────────────────────── */}
          <div className="mt-8 flex flex-col gap-2.5">
            <Label>{record.decision.label}</Label>
            <p className="max-w-[64ch] text-lede text-ink">{record.decision.body}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
