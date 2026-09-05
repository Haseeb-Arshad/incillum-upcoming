import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { evidence } from '#/content/site.ts'

const euros = (value: number) =>
  `EUR ${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** A readable causal diagram, with the underlying record available to inspect. */
export function Evidence() {
  const { record, visual } = evidence
  const beforeMargin = (1 - visual.unitCostBefore / visual.unitPrice) * 100
  const afterMargin = (1 - visual.unitCostAfter / visual.unitPrice) * 100
  const margins = [
    { label: visual.beforeMarginLabel, value: beforeMargin },
    { label: visual.afterMarginLabel, value: afterMargin },
  ]

  return (
    <section aria-labelledby="evidence-heading" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="ic-evidence-intro">
          <div>
            <Label className="mb-5">{evidence.label}</Label>
            <h2 id="evidence-heading" className="max-w-[20ch] text-title text-ink">
              {evidence.headline}
            </h2>
          </div>
          <p className="max-w-[52ch] text-lede text-ink-600">{evidence.lede}</p>
        </Reveal>

        <div className="ic-evidence-panel mt-10 sm:mt-14">
          <div className="ic-evidence-metadata">
            <p className="ic-tabular text-label uppercase text-ink-400">
              {record.reference}
            </p>
            <p className="text-body text-ink">{record.part}</p>
            <p className="ic-tabular text-small text-ink-400">
              {record.revisedLabel} {record.revisedAt}
            </p>
          </div>

          <div className="ic-evidence-flow">
            <div className="ic-evidence-source">
              <Label>{visual.sourceLabel}</Label>
              <h3 className="mt-3 text-heading text-ink">{visual.sourceTitle}</h3>
              <div className="ic-source-sheet">
                <p className="text-small text-ink-600">{visual.sourceReference}</p>
                <div className="mt-6 border-t border-line pt-6">
                  <p className="text-small text-ink-400">{visual.costLabel}</p>
                  <div className="ic-cost-comparison mt-4">
                    <div>
                      <p className="ic-tabular text-quote text-ink-400">
                        {euros(visual.unitCostBefore)}
                      </p>
                      <p className="mt-1 text-small text-ink-400">{visual.beforeLabel}</p>
                    </div>
                    <span aria-hidden="true" className="text-ink-400">
                      →
                    </span>
                    <div>
                      <p className="ic-tabular text-quote text-ink">
                        {euros(visual.unitCostAfter)}
                      </p>
                      <p className="mt-1 text-small text-ink-400">{visual.afterLabel}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 border-t border-line pt-5 text-small text-ink-600">
                  {visual.leadTime}
                </p>
              </div>
              <p className="mt-5 text-small text-ink-600">
                {visual.quoteLabel}{' '}
                <span className="ic-tabular text-ink">{euros(visual.unitPrice)}</span>.
              </p>
            </div>

            <div className="ic-evidence-impact">
              <Label>{visual.impactLabel}</Label>
              <h3 className="mt-3 text-heading text-ink">{visual.impactTitle}</h3>
              <div
                role="group"
                aria-label={visual.chartLabel}
                className="ic-margin-chart"
              >
                {margins.map((margin) => (
                  <div key={margin.label} className="ic-margin-row">
                    <div className="mb-3 flex items-baseline justify-between gap-4">
                      <span className="text-small text-ink-600">{margin.label}</span>
                      <span className="ic-tabular text-quote text-ink">
                        {margin.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className="ic-margin-track">
                      <div
                        className="ic-margin-bar"
                        style={{ width: `${(margin.value / visual.scaleMax) * 100}%` }}
                      />
                      <span
                        className="ic-margin-floor"
                        style={{
                          left: `${(visual.floorPercent / visual.scaleMax) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-between gap-4 text-small text-ink-400">
                  <span>0%</span>
                  <span>{visual.scaleMax}%</span>
                </div>
                <p className="mt-3 text-small text-ink-400">
                  {visual.floorLabel} · {visual.floorPercent.toFixed(1)}%
                </p>
              </div>
              <div className="ic-shortfall">
                <p className="text-small text-ink-600">{visual.shortfallLabel}</p>
                <p className="ic-tabular ic-shortfall-number text-signal">
                  {record.calculation.shortfall.amount}
                </p>
                <p className="max-w-[48ch] text-small text-ink-600">
                  {visual.shortfallExplanation}
                </p>
              </div>
            </div>
          </div>

          <div className="ic-evidence-decision">
            <h3 className="text-heading text-ink">{visual.decisionTitle}</h3>
            <p className="max-w-[66ch] text-body text-ink-600">{visual.decisionBody}</p>
          </div>

          <details className="ic-evidence-details">
            <summary className="flex cursor-pointer items-center justify-between gap-6 text-small font-medium text-ink">
              {visual.detailsLabel}
              <span aria-hidden="true">↓</span>
            </summary>
            <div className="ic-evidence-detail-grid">
              <div>
                <Label>{record.source.label}</Label>
                <dl className="mt-5">
                  {record.source.items.map((item) => (
                    <div key={item.term} className="border-t border-line py-4">
                      <dt className="text-body text-ink">{item.term}</dt>
                      <dd className="mt-1 text-small text-ink-600">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Label className="mt-6">{record.finding.label}</Label>
                <p className="mt-3 text-small text-ink-600">{record.finding.body}</p>
              </div>
              <div>
                <Label>{record.calculation.label}</Label>
                <table className="mt-5 w-full table-fixed border-collapse text-left">
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">{record.calculation.columns.basis}</th>
                      <th scope="col">{record.calculation.columns.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.calculation.rows.map((row) => (
                      <tr key={row.basis} className="border-t border-line">
                        <th
                          scope="row"
                          className="w-[52%] py-4 pr-3 align-top text-small font-normal text-ink"
                        >
                          {row.basis}
                          <span className="ic-tabular mt-1 block text-small text-ink-400">
                            {row.working}
                          </span>
                        </th>
                        <td className="ic-tabular py-4 text-right align-top text-small text-ink">
                          {row.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 border-t border-line pt-4 text-small text-ink-600">
                  {record.calculation.shortfall.working} ·{' '}
                  {record.calculation.shortfall.amount}
                </p>
                <Label className="mt-6">{record.decision.label}</Label>
                <p className="mt-3 text-small text-ink-600">{record.decision.body}</p>
              </div>
            </div>
          </details>
        </div>
      </Container>
    </section>
  )
}
