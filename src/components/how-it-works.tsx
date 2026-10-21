import { useRef, useState } from 'react'

import { DocumentQuestion, SourceDocument } from '#/components/glass-documents.tsx'
import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { boundary, evidence, glass, home, how, thread } from '#/content/site.ts'
import { useHydrated } from '#/lib/motion.ts'

import type { HowKey, HowStep } from '#/content/site.ts'
import type { KeyboardEvent } from 'react'

/**
 * How it works — four tabs, one quotation.
 *
 * ── The shape it borrows ───────────────────────────────────────────────────
 *
 * The product rail the reference pages use: a column of tabs, and beside it a
 * panel that changes. Here the tabs are the four things that happen to one
 * request, and each panel is that step at the magnification of a single line —
 * the documents it was read from, lying on the desk under the lamp, and the lit
 * card it became. The last tab is 08:04, and its desk is in morning light.
 *
 * Each panel ends on where the step stops: one entry of `boundary` per tab, so
 * the four limits are read in passing rather than handed over as a list.
 *
 * ── Nothing is written twice ───────────────────────────────────────────────
 *
 * Every figure is computed from `evidence` or read off the 06:50 ledger, every
 * line and status is the matrix's, every note is the film's, and the documents
 * are the desk's own (`glass-documents.tsx`). So the tabs cannot disagree with
 * the film above them or the sources beside them.
 *
 * ── Without a script, and with one ─────────────────────────────────────────
 *
 * The server's HTML is the four steps in order, each with its heading, its
 * copy and its desk — the whole section readable with nothing running. Once
 * React is attached it becomes a real tablist: the arrow keys, Home and End move
 * between tabs, selection follows focus, and the panels sit in one cell so the
 * section keeps its height. The change is one short crossfade, and under
 * reduced motion an instant swap.
 */

const { visual, record } = evidence
const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
const shortfall = ledger.find((entry) => entry.breaches)

const euros = (value: number) =>
  `EUR ${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Line 14's margin before and after the 03:42 answer, from its own unit figures. */
const marginBefore = (1 - visual.unitCostBefore / visual.unitPrice) * 100
const marginAfter = (1 - visual.unitCostAfter / visual.unitPrice) * 100
const atFloor = record.calculation.rows.find((row) => row.basis.startsWith('At the'))

const frameAt = (at: string) => glass.film.frames.find((frame) => frame.at === at)
const limitOf = (step: HowStep) => boundary.points.find((point) => point.title === step.stops)

export function HowItWorks() {
  const hydrated = useHydrated()
  const [active, setActive] = useState<HowKey>(how.steps[0]!.key)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const index = how.steps.findIndex((step) => step.key === active)
    const last = how.steps.length - 1
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setActive(how.steps[next]!.key)
    tabs.current[next]?.focus()
  }

  return (
    <section id={how.anchor} aria-labelledby="how-title" className="how">
      <Container>
        <Reveal className="how-intro">
          <Label>{how.label}</Label>
          <h2 id="how-title" className="how-title">
            {how.headline}
          </h2>
          <p className="how-lede">{how.lede}</p>
        </Reveal>

        <div className="how-body" data-enhanced={hydrated ? 'true' : 'false'}>
          {hydrated ? (
            <div
              role="tablist"
              aria-label={how.tabsLabel}
              aria-orientation="vertical"
              className="how-tabs"
              onKeyDown={move}
            >
              {how.steps.map((step, index) => {
                const selected = step.key === active
                return (
                  <button
                    key={step.key}
                    ref={(element) => {
                      tabs.current[index] = element
                    }}
                    type="button"
                    role="tab"
                    id={`how-tab-${step.key}`}
                    aria-controls={`how-panel-${step.key}`}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    className="how-tab"
                    onClick={() => setActive(step.key)}
                  >
                    <span className="how-tab-number ic-tabular" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="how-tab-name">{step.tab}</span>
                    <span className="how-tab-title">{step.title}</span>
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="how-panels">
            {how.steps.map((step, index) => {
              const selected = step.key === active
              return (
                <div
                  key={step.key}
                  id={`how-panel-${step.key}`}
                  className="how-panel"
                  data-step={step.key}
                  data-active={!hydrated || selected ? 'true' : 'false'}
                  role={hydrated ? 'tabpanel' : undefined}
                  aria-labelledby={hydrated ? `how-tab-${step.key}` : undefined}
                  tabIndex={hydrated && selected ? 0 : undefined}
                  inert={hydrated && !selected ? true : undefined}
                  // Out of the accessibility tree the moment it is deselected,
                  // not when its fade ends: one tabpanel at a time, always.
                  aria-hidden={hydrated && !selected ? true : undefined}
                >
                  {/*
                    Without a script there is no tab to name the step, so the
                    panel carries its own heading. With one, the tab is its name.
                  */}
                  {hydrated ? null : (
                    <h3 className="how-panel-heading">
                      <span className="ic-tabular">{String(index + 1).padStart(2, '0')}</span>{' '}
                      {step.tab}. {step.title}
                    </h3>
                  )}
                  <StepCopy step={step} />
                  <Desk step={step} />
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

/** What happens in the step, and the one place it stops. */
function StepCopy({ step }: { step: HowStep }) {
  const limit = limitOf(step)
  return (
    <div className="how-copy">
      <p className="how-line">{step.line}</p>
      <div className="how-stops">
        <p className="how-stops-label">{how.stopsLabel}</p>
        <p className="how-stops-line">
          <strong>{limit?.title}.</strong> {step.stopsLine}
        </p>
      </div>
    </div>
  )
}

/**
 * The desk under the lamp, from above, with this step's documents on it.
 *
 * The photograph and the documents are pictures of the problem — the request,
 * the catalogue page, the drawing, the confirmation — so they are hidden from a
 * screen reader, which hears the step's copy and the lit card instead. The card
 * is real text: it carries line 14's margins and shortfall, which are on the
 * page nowhere else. The first three steps are the night; the last is the same
 * desk at 08:04.
 */
function Desk({ step }: { step: HowStep }) {
  const light = step.at === thread.beats.at(-1)?.at ? 'morning' : 'night'
  return (
    <div className="how-desk" data-light={light}>
      <DeskPhoto light={light} />
      <div className="how-desk-pieces">
        {step.key === 'read' ? <ReadPieces /> : null}
        {step.key === 'hold' ? <HoldPieces /> : null}
        {step.key === 'price' ? <PricePieces /> : null}
        {step.key === 'decide' ? <DecidePieces /> : null}
      </div>
    </div>
  )
}

function DeskPhoto({ light }: { light: 'night' | 'morning' }) {
  const widths = [720, 1120, 1600]
  const sizes = '(min-width: 64rem) 58vw, 100vw'
  return (
    <picture className="how-desk-photo" aria-hidden="true">
      <source
        type="image/avif"
        sizes={sizes}
        srcSet={widths.map((width) => `/how/desk-${light}-${width}.avif ${width}w`).join(', ')}
      />
      <source
        type="image/webp"
        sizes={sizes}
        srcSet={widths.map((width) => `/how/desk-${light}-${width}.webp ${width}w`).join(', ')}
      />
      <img
        src={`/how/desk-${light}-1600.jpg`}
        alt=""
        width={1600}
        height={1200}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </picture>
  )
}

/** 00:06 — the request as it arrived, and what it was read into. */
function ReadPieces() {
  const { request, agreement } = glass.sources.documents
  const fields = how.panels.read.fields
  const rows = [
    { term: fields.request, value: /RFQ \d+/.exec(request.subject)?.[0] ?? '' },
    { term: fields.terms, value: agreement.title },
    { term: fields.lines, value: String(home.matrix.lines.total) },
    { term: fields.due, value: /\w+day\b/.exec(home.matrix.due)?.[0] ?? '' },
  ]
  return (
    <>
      <div aria-hidden="true" className="how-doc how-doc--request">
        <SourceDocument source="request" floor={figure('Commercial floor')} />
        <DocumentQuestion source="request" />
      </div>
      <div data-lit="" className="how-card how-card--read">
        <p className="how-card-title">
          <span className="matrix-mark" aria-hidden="true" />
          {how.panels.read.title}
        </p>
        <dl className="how-card-fields">
          {rows.map((row) => (
            <div key={row.term}>
              <dt>{row.term}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="how-card-note">{frameAt(how.steps[0]!.at)?.note}</p>
      </div>
    </>
  )
}

/** 01:18 — the two documents that cannot settle their lines, and the lines held for them. */
function HoldPieces() {
  const held = home.matrix.rows.filter((row) => row.status === 'held')
  const step = how.steps.find((entry) => entry.key === 'hold')!
  return (
    <>
      <div aria-hidden="true" className="how-doc how-doc--catalogue">
        <SourceDocument source="catalogue" floor={figure('Commercial floor')} />
        <DocumentQuestion source="catalogue" />
      </div>
      <div aria-hidden="true" className="how-doc how-doc--drawing">
        <SourceDocument source="drawing" floor={figure('Commercial floor')} />
        <DocumentQuestion source="drawing" />
      </div>
      <div data-lit="" className="how-card how-card--hold">
        <p className="how-card-title">
          <span className="matrix-mark" aria-hidden="true" />
          {home.matrix.title}
        </p>
        <ul className="how-card-lines">
          {held.map((row) => (
            <li key={row.line}>
              <span className="how-card-line ic-tabular">{row.line}</span>
              <span className="how-card-item">
                {row.item}
                <span>{row.evidence}</span>
              </span>
              <span className="matrix-status matrix-status--held">
                {home.matrix.statusLabels.held}
              </span>
            </li>
          ))}
        </ul>
        <p className="how-card-note">{frameAt(step.at)?.note}</p>
      </div>
    </>
  )
}

/** 03:42 — the confirmation that arrived, and line 14's margin crossing the floor. */
function PricePieces() {
  const margins = [
    { label: visual.beforeMarginLabel, value: marginBefore },
    { label: visual.afterMarginLabel, value: marginAfter },
  ]
  return (
    <>
      <div aria-hidden="true" className="how-doc how-doc--supplier">
        <SourceDocument source="supplier" floor={figure('Commercial floor')} />
      </div>
      <div data-lit="" className="how-card how-card--price">
        <p className="how-card-title">
          <span className="matrix-mark" aria-hidden="true" />
          {record.reference}
        </p>
        <p className="how-card-part">{record.part}</p>
        <p className="how-card-quoted">
          {how.panels.price.quoted} <span>{euros(visual.unitPrice)}</span>
        </p>
        <div className="how-margins">
          {margins.map((margin) => (
            <div key={margin.label} className="how-margin">
              <p>
                <span>{margin.label}</span>
                <span>{margin.value.toFixed(1)}%</span>
              </p>
              <span
                className="how-margin-track"
                style={{
                  ['--how-value' as string]: margin.value / visual.scaleMax,
                  ['--how-floor' as string]: visual.floorPercent / visual.scaleMax,
                }}
              >
                <span className="how-margin-bar" />
                <span className="how-margin-floor" />
              </span>
            </div>
          ))}
          <p className="how-margin-scale">
            {visual.floorLabel} · {figure('Commercial floor')}
          </p>
        </div>
        <p className="how-card-short">
          <span>{visual.shortfallLabel}</span>
          <strong>{record.calculation.shortfall.amount}</strong>
        </p>
      </div>
    </>
  )
}

/** 08:04 — the three ways to price the largest line, and the quotation's two figures. */
function DecidePieces() {
  const last = glass.film.frames.at(-1)
  const person = last?.chips.find((chip) => !chip.source)
  const { options, quotation } = how.panels.decide
  const figures: Record<(typeof options)[number]['key'], string> = {
    keep: `${euros(visual.unitPrice)} · ${marginAfter.toFixed(1)}%`,
    floor: `${atFloor?.working ?? ''} · ${visual.floorPercent.toFixed(1)}%`,
    split: '',
  }
  return (
    <div data-lit="" className="how-card how-card--decide">
      {person ? (
        <span className="glass-chip" data-fresh="true">
          <span className="glass-chip-person" aria-hidden="true" />
          {person.text}
        </span>
      ) : null}
      <p className="how-decide-title">{visual.decisionTitle}</p>
      <ol className="how-options">
        {options.map((option) => (
          <li key={option.key}>
            <span className="how-option-title">{option.title}</span>
            <span className="how-option-detail">{option.detail}</span>
            {figures[option.key] ? (
              <span className="how-option-figure">{figures[option.key]}</span>
            ) : null}
          </li>
        ))}
      </ol>
      <dl className="how-decide-figures">
        <div>
          <dt>{quotation}</dt>
          <dd>
            {figure('Expected margin')}
            <span>
              {' '}
              · {home.matrix.summary.floor} {figure('Commercial floor')}
            </span>
          </dd>
        </div>
        {shortfall ? (
          <div className="how-decide-short">
            <dt>{shortfall.term}</dt>
            <dd>{shortfall.value}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
