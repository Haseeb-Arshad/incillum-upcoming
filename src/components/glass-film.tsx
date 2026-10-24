import { useRef, useState } from 'react'

import { SourceIcon } from '#/components/glass-documents.tsx'
import { Container } from '#/components/primitives.tsx'
import { evidence, glass, home, thread } from '#/content/site.ts'
import { useHydrated, useInView, useReducedMotion } from '#/lib/motion.ts'

import type { GlassSource, GlassStatus, MatrixStatus } from '#/content/site.ts'
import type { AnimationEvent } from 'react'

/**
 * The film — one night, played in a frame under the hero.
 *
 * ── What it is ─────────────────────────────────────────────────────────────
 *
 * The night thread at another magnification, which is the only kind of second
 * look this site allows itself. On the left, the hour and what happened in it.
 * On the right, one sheet — the matrix's own rows, set as a spreadsheet — that
 * fills as the night goes: empty at 23:47, read at 00:06, two lines held at
 * 01:18, a cost moved at 03:42, the ledger at 06:50, a person at 08:04. Each
 * hour the selection moves to the cell it changed, and where a spreadsheet's
 * formula bar would show a formula, this one shows the document the value came
 * from: every figure keeps the page it came from.
 *
 * Nothing here is written down twice. The hours and titles are the thread's,
 * the rows and states are the matrix's, the money is the 06:50 ledger's, and the
 * hours at which the sheet changes are found in the thread rather than numbered
 * here — so re-ordering a beat cannot leave the sheet changing at the wrong time.
 *
 * ── How it moves, and when it does not ─────────────────────────────────────
 *
 * Each hour runs for `--glass-frame`, timed by the progress hairline under its
 * chapter: the hairline is a CSS animation, and its `animationend` is what
 * advances the film. One clock, so pausing is `animation-play-state` and the
 * hairline and the film can never disagree about where they are.
 *
 * It goes round: after a longer hold on 08:04 the night starts again, by the
 * owner's choice, so a reader who arrives late still sees it from 23:47. The
 * hairlines under the hours join into one line along the foot of the frame,
 * and the ring round the play button fills with each hour. It waits for the
 * opening to finish and for the frame to be on screen, pauses when it leaves,
 * and the reader can pause it. Under reduced motion it never plays; the hours
 * are chapters to step through.
 *
 * Without JavaScript every hour is listed and the sheet shows the morning,
 * which is the whole story in the server's HTML. The licence is the frame's
 * first line either way, and it is a sentence rather than a label: the
 * quotation is invented for this page.
 */

const { film } = glass
const LAST = thread.beats.length - 1

/**
 * The hours at which the sheet changes, found rather than numbered: the held
 * lines arrive with the beat that carries a state, the moved cost with the beat
 * whose hour the matrix's moved line names, and the prices with the ledger.
 */
const HELD = thread.beats.findIndex((beat) => beat.state)
const LEDGER = thread.beats.findIndex((beat) => beat.figures)
const movedRow = home.matrix.rows.find((row) => row.status === 'changed')
const MOVED = thread.beats.findIndex((beat) => movedRow?.evidence.includes(beat.at))

const ledger = thread.beats[LEDGER]?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)
const percent = (value: string | undefined) =>
  Number(/([\d.]+)%/.exec(value ?? '')?.[1] ?? 0)
const quote = figure('Quote value')
const margin = figure('Expected margin')
const floor = figure('Commercial floor')
const short = ledger.find((entry) => entry.breaches)

/** Where a line stands at a given hour. `null` is 23:47, when the request is still a PDF. */
function statusAt(final: MatrixStatus, stage: number): GlassStatus | null {
  if (stage < 1) return null
  if (final === 'held') return stage >= HELD ? 'held' : 'read'
  if (final === 'changed') return stage >= MOVED ? 'changed' : 'read'
  return stage >= LEDGER ? 'priced' : 'read'
}

/** The latest source to land on a target by this hour, and whether it landed in this one. */
function chipAt(target: string, stage: number) {
  for (let hour = stage; hour >= 0; hour -= 1) {
    const chip = film.frames[hour]?.chips.find((entry) => entry.target === target)
    if (chip) return { text: chip.text, source: chip.source, fresh: hour === stage }
  }
  return null
}

const { sheet } = film
const { documents } = glass.sources

/** The grid's columns, in order. Their letters are a spreadsheet's: A for the first. */
const columns = ['line', 'item', 'category', 'quantity', 'rate', 'status'] as const
type Column = (typeof columns)[number]
const letter = (column: Column) => String.fromCharCode(65 + columns.indexOf(column))

type SheetLine = { category: string; quantity: string; rate?: { from: string; part: string } }
const sheetLine = (line: string): SheetLine | undefined =>
  (sheet.lines as Record<string, SheetLine>)[line]

/**
 * The header is row 1, so line NN sits on row NN + 1, and the rows between the
 * lines the matrix shows are hidden the way a spreadsheet hides them.
 */
const rowOf = (line: string) => Number(line) + 1
const lastRow = home.matrix.lines.total + 1

/** A line's rate at an hour, read off the document row it names — never written here. */
function rateAt(line: string, stage: number): { now: string; was?: string } | null {
  const source = sheetLine(line)?.rate
  if (stage < 1 || !source) return null
  if (source.from === 'agreement') {
    for (const clause of documents.agreement.clauses) {
      if (!('rates' in clause)) continue
      const rate = clause.rates.find((entry) => entry.part === source.part)?.rate
      if (rate) return { now: rate }
    }
    return null
  }
  const cost = documents.prices.rows.find((row) => row.part === source.part)?.cost
  if (!cost) return null
  const change = documents.supplier.changes.find((entry) => entry.was === cost)
  if (source.part === documents.prices.moving && change && stage >= MOVED) {
    return { now: change.now, was: change.was }
  }
  return { now: cost }
}

interface Selection {
  /** What the name box says. */
  name: string
  cells: ReadonlySet<string>
  range?: 'rows' | 'all' | 'floor'
}

/**
 * Where the selection stands at an hour, and what the name box calls it: the
 * first cell while the sheet is empty, every line while the night reads them,
 * the cells a source changed, the floor when the ledger meets it — and at
 * 08:04 the whole quotation, handed to a person.
 */
function selectionAt(stage: number): Selection {
  const targets = film.frames[stage]?.chips.map((chip) => chip.target) ?? []
  if (stage === LAST) return { name: sheet.all, cells: new Set(), range: 'all' }
  if (targets.includes('floor')) return { name: film.floor, cells: new Set(), range: 'floor' }
  const lines = targets.filter((target) => sheetLine(target))
  if (lines.length) {
    const cells = lines.map((line) => {
      const moved = home.matrix.rows.find((row) => row.line === line)?.status === 'changed'
      return `${letter(moved ? 'rate' : 'status')}${rowOf(line)}`
    })
    return { name: cells.join(', '), cells: new Set(cells) }
  }
  if (targets.includes('head')) return { name: 'A1', cells: new Set(['A1']) }
  return { name: `A2:${letter('status')}${lastRow}`, cells: new Set(), range: 'rows' }
}

export function GlassFilm({ ready }: { ready: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  const inView = useInView(frameRef, 0.45)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  /** Bumped to restart the hairline and the ring when a chapter is chosen. */
  const [take, setTake] = useState(0)

  const autoplay = hydrated && !reduced
  const running = autoplay && ready && playing && inView
  /** Without a script the sheet shows the morning, beside the whole night listed. */
  const stage = hydrated ? index : LAST

  /** The hour's hairline has filled: the next hour, or round to 23:47 after the morning. */
  function advance(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName !== 'glass-progress') return
    setIndex(index < LAST ? index + 1 : 0)
  }

  function choose(hour: number) {
    setIndex(hour)
    setTake((count) => count + 1)
  }

  const control = playing ? film.controls.pause : film.controls.play

  return (
    <section id="film" aria-labelledby="film-label" className="glass-film-section">
      <Container>
        <div
          ref={frameRef}
          className="glass-film"
          data-enhanced={hydrated ? 'true' : 'false'}
          data-running={running ? 'true' : 'false'}
          data-stage={stage}
        >
          <div className="glass-film-body">
            <div className="glass-film-story">
              {/*
                The licence, first, in the server's HTML, at reading size — and
                the section's name, because it is the truest one-line
                description of what the frame holds.
              */}
              <h2 id="film-label" className="glass-film-licence">
                {film.licence}
              </h2>

              {/*
                Polite while the reader is driving, silent while it plays itself
                — an announcement every few seconds would talk over everything.
              */}
              <ol className="glass-beats" aria-live={running ? 'off' : 'polite'}>
                {thread.beats.map((beat, hour) => (
                  <li
                    key={beat.at}
                    className="glass-beat"
                    data-active={hour === index ? 'true' : 'false'}
                  >
                    <p className="glass-beat-hour">{beat.at}</p>
                    <h3 className="glass-beat-title">{beat.title}</h3>
                    <p className="glass-beat-line">{film.frames[hour]?.line}</p>
                  </li>
                ))}
              </ol>
            </div>

            <Sheet stage={stage} />
          </div>

          {hydrated ? (
            <div className="glass-rail">
              {autoplay ? (
                <button
                  type="button"
                  className="glass-play"
                  aria-label={control}
                  title={control}
                  onClick={() => setPlaying(!playing)}
                >
                  {/* The hour's progress, round the button: the same clock as the hairline. */}
                  <svg className="glass-play-ring" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
                    <circle className="glass-play-ring-track" cx="22" cy="22" r="20.75" />
                    <circle
                      key={`${take}-${index}`}
                      className="glass-play-ring-fill"
                      data-last={index === LAST ? 'true' : undefined}
                      cx="22"
                      cy="22"
                      r="20.75"
                      pathLength={100}
                    />
                  </svg>
                  <PlayIcon state={playing ? 'pause' : 'play'} />
                </button>
              ) : null}

              <div
                role="group"
                aria-label={film.controls.chapters}
                className="glass-chapters"
              >
                {thread.beats.map((beat, hour) => (
                  <button
                    key={beat.at}
                    type="button"
                    className="glass-chapter"
                    aria-label={`${beat.at} — ${beat.title}`}
                    aria-current={hour === index ? 'step' : undefined}
                    data-done={hour < index ? 'true' : 'false'}
                    onClick={() => choose(hour)}
                  >
                    <span className="glass-chapter-track" aria-hidden="true">
                      {hour === index && autoplay ? (
                        <span
                          key={`${take}-${hour}`}
                          className="glass-chapter-fill glass-chapter-fill--live"
                          onAnimationEnd={advance}
                        />
                      ) : (
                        <span className="glass-chapter-fill" />
                      )}
                    </span>
                    <span className="glass-chapter-hour ic-tabular" aria-hidden="true">
                      {beat.at}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

/**
 * The sheet under the lamp, at one hour of the night, set as a spreadsheet.
 *
 * A real table — the matrix's rows under the columns a quotation is worked in
 * — with a spreadsheet's furniture: column letters, row numbers, hidden rows
 * where the matrix skips lines, a selection with its fill handle, and a name
 * box. Where the formula bar would be is the source bar: the document this
 * hour's change came from, and a line on what the night has done so far. The
 * cells start empty, because at 23:47 the request is still a PDF; nothing is
 * drawn as a grey bar standing in for text.
 *
 * On a narrow sheet the category and quantity columns are hidden, the way a
 * spreadsheet hides columns: the letters skip them, and the selection never
 * lands in them.
 */
function Sheet({ stage }: { stage: number }) {
  const head = chipAt('head', stage)
  const selection = selectionAt(stage)
  const frame = film.frames[stage]
  const read = stage >= 1
  const selected = (cell: string) => (selection.cells.has(cell) ? 'true' : undefined)

  return (
    <div data-lit="" className="glass-sheet" data-stage={stage} data-range={selection.range}>
      <div className="glass-sheet-bar">
        <p className="glass-sheet-title">
          <span className="matrix-mark" aria-hidden="true" />
          {film.title}
        </p>
        {head ? <Chip key={head.text} {...head} /> : null}
      </div>

      <div className="glass-sheet-sourcebar">
        <span className="glass-namebox ic-tabular" aria-hidden="true">
          {selection.name}
        </span>
        <p key={stage} className="glass-sheet-sources">
          {frame?.chips.map((chip) => (
            <Chip key={chip.text} text={chip.text} source={chip.source} fresh />
          ))}
          {frame?.note ? <span className="glass-sheet-note">{frame.note}</span> : null}
        </p>
      </div>

      <table className="glass-grid" aria-label={film.title}>
        <thead>
          <tr className="glass-grid-letters" aria-hidden="true">
            <td className="glass-grid-index" />
            {columns.map((column) => (
              <td key={column} data-column={column}>
                {letter(column)}
              </td>
            ))}
          </tr>
          <tr className="glass-grid-head">
            <td className="glass-grid-index" aria-hidden="true">
              1
            </td>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                data-column={column}
                data-selected={selected(`${letter(column)}1`)}
              >
                {sheet.columns[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {home.matrix.rows.map((row, index) => {
            const status = statusAt(row.status, stage)
            const line = sheetLine(row.line)
            const rate = rateAt(row.line, stage)
            const number = rowOf(row.line)
            const previous = home.matrix.rows[index - 1]
            const hidden = previous ? number - rowOf(previous.line) > 1 : number > 2
            return (
              <tr
                key={row.line}
                className="glass-sheet-row"
                data-status={status ?? 'unread'}
                data-after-hidden={hidden ? 'true' : undefined}
                style={{ ['--row' as string]: index }}
              >
                <td className="glass-grid-index" aria-hidden="true">
                  {number}
                </td>
                <td data-column="line" className="ic-tabular">
                  {read ? row.line : null}
                </td>
                <td data-column="item">{read ? row.item : null}</td>
                <td data-column="category">{read ? line?.category : null}</td>
                <td data-column="quantity" className="ic-tabular">
                  {read ? line?.quantity : null}
                </td>
                <td
                  data-column="rate"
                  className="ic-tabular"
                  data-selected={selected(`${letter('rate')}${number}`)}
                >
                  {rate ? (
                    <span key={rate.now} className="glass-cell-value">
                      {rate.was ? <s>{rate.was}</s> : null}
                      {rate.now}
                    </span>
                  ) : read ? (
                    <span className="glass-cell-empty">—</span>
                  ) : null}
                </td>
                <td
                  data-column="status"
                  data-selected={selected(`${letter('status')}${number}`)}
                >
                  {status ? (
                    <span
                      key={status}
                      className={`matrix-status matrix-status--${status} glass-status`}
                    >
                      {film.statusLabels[status]}
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          })}
          {/*
            One cell a column rather than one spanning them, so a hidden column
            hides here too and the span never invents a column of its own.
          */}
          <tr className="glass-sheet-more" data-after-hidden="true">
            <td className="glass-grid-index" aria-hidden="true" />
            {columns.map((column) => (
              <td key={column} data-column={column}>
                {column === 'item' && read ? (
                  <>
                    <span className="ic-tabular">{home.matrix.more.count}</span> {film.more}
                  </>
                ) : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <Foot stage={stage} selected={selection.range === 'floor'} />
    </div>
  )
}

/**
 * The foot: the quotation's totals, pending until the ledger exists at 06:50.
 *
 * Laid out from the first hour, so the sheet is as tall at 23:47 as at 08:04
 * and nothing under the film moves while it plays: before 06:50 the totals are
 * a dash, the way an empty total cell reads, and the margin's bar is empty.
 */
function Foot({ stage, selected }: { stage: number; selected: boolean }) {
  const priced = stage >= LEDGER
  const floorChip = chipAt('floor', stage)
  const scale = evidence.visual.scaleMax

  return (
    <div className="glass-sheet-foot" data-ledger={priced ? 'true' : 'false'}>
      <div className="glass-sheet-ledger">
        {/*
          The matrix's own summary, in the same words: the quote, and its margin
          against the floor. Proportional figures — the serif's tabular ones are
          set for columns, and these are read one at a time.
        */}
        <dl className="glass-sheet-figures">
          <div>
            <dt>{quote?.term}</dt>
            <dd>{priced ? quote?.value : '—'}</dd>
          </div>
          <div data-selected={selected ? 'true' : undefined}>
            <dt>{margin?.term}</dt>
            <dd>
              {priced ? margin?.value : '—'}
              {priced ? (
                <span>
                  {' '}
                  · {home.matrix.summary.floor} {floor?.value}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {/*
          Margin against the floor on the evidence document's zero-to-twenty-
          five scale. The bar is ink and the floor is a hairline; the colour is
          spent on the shortfall underneath, which is the figure that broke it.
          The floor's label ends where the floor is, and the agreement it came
          from lands beside it.
        */}
        <div
          className="glass-margin"
          aria-hidden="true"
          style={{
            ['--glass-margin' as string]: percent(margin?.value) / scale,
            ['--glass-floor' as string]: percent(floor?.value) / scale,
          }}
        >
          <span className="glass-margin-label">
            {floorChip ? <Chip {...floorChip} /> : null}
            <span>
              {film.floor} {floor?.value}
            </span>
          </span>
          <span className="glass-margin-track">
            <span className="glass-margin-bar" />
            <span className="glass-margin-floor" />
          </span>
        </div>

        {short ? (
          <p className="glass-sheet-short" aria-hidden={!priced}>
            <span>{short.term}</span>
            <strong>{short.value}</strong>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * A source, landed on the sheet, with the icon of the kind of document it is.
 * The newest one is drawn in ink; older ones step back. The one with no source
 * is the person the night ends with.
 */
function Chip({
  text,
  source,
  fresh,
}: {
  text: string
  source?: GlassSource
  fresh: boolean
}) {
  return (
    <span className="glass-chip" data-fresh={fresh ? 'true' : 'false'}>
      {source ? (
        <SourceIcon source={source} />
      ) : (
        <span className="glass-chip-person" aria-hidden="true" />
      )}
      {text}
    </span>
  )
}

/** Sixteen-pixel glyphs on `currentColor`. Two of them do not earn a package. */
function PlayIcon({ state }: { state: 'play' | 'pause' }) {
  const common = {
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true,
    className: 'size-4',
  } as const
  if (state === 'pause') {
    return (
      <svg {...common}>
        <path
          d="M5.5 3.5v9M10.5 3.5v9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path
        d="M5 3.25v9.5L12.5 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
