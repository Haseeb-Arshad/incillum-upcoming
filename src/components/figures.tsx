import type { ReactElement } from 'react'

/**
 * The capability figures.
 *
 * ── The rule these are drawn under ─────────────────────────────────────────
 *
 * **Nothing here may look like a screenshot.** No window chrome, no title bars,
 * no buttons, no cursors, no rounded app frames. There is no product to
 * photograph, and a convincing mock-up of an interface that does not exist is a
 * picture of something untrue — the single most common lie on a pre-launch page
 * and the one a reader is most likely to feel later.
 *
 * What is allowed is a *drawing*: a schematic of what the operator is being
 * built to do, in the same hairline language as the clock further up the page.
 * A specification drawing claims a design. A screenshot claims a product.
 *
 * ── Why each one carries real words ────────────────────────────────────────
 *
 * Every figure labels its own parts — INVOICE, PO, RECEIPT, NOT FOUND — rather
 * than filling itself with grey placeholder bars. A diagram made of grey bars
 * is a wireframe, and a wireframe on a marketing page reads as something that
 * was not finished. The bars that remain stand in only for values, never for
 * meaning, and **no figure contains a number**: an invented figure in a drawing
 * is still an invented figure.
 *
 * ── Drawing conventions ────────────────────────────────────────────────────
 *
 *   structure     `stroke-line-strong`, 1px, non-scaling
 *   emphasis      `stroke-ink` / `fill-ink` — at most twice per figure
 *   a break       a dashed run; never a colour, because there is no colour
 *   labels        10px, tracked, `fill-ink-400`
 *
 * `vectorEffect="non-scaling-stroke"` holds every rule at exactly one device
 * pixel however the figure is scaled. Without it a 480-unit drawing rendered at
 * 560px thickens every hairline by 17%, which is the difference between a
 * drawing and a sketch.
 *
 * ── The margin, which is a real constraint ─────────────────────────────────
 *
 * Every figure is laid out to fill `12 → 468` horizontally and `12 → 288`
 * vertically. The first pass did not, and the slack inside each viewBox stacked
 * on top of the panel's own padding: the drawings floated in the middle of
 * large white cards looking like placeholders for something better. A figure
 * that does not fill its box reads as unfinished, however carefully it is
 * drawn.
 */

const VIEW_BOX = '0 0 480 300'

/** Shared props for a structural hairline. */
const rule = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1,
  className: 'stroke-line-strong',
} as const

/** Shared props for the one or two lines in a figure that carry the meaning. */
const emphasis = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1.5,
  className: 'stroke-ink',
} as const

function Caption({
  x,
  y,
  anchor = 'start',
  children,
}: {
  x: number
  y: number
  /**
   * `end` matters as much as the other two. A right-hand column header set with
   * `middle` at the drawing's right edge overhangs the viewBox by half its own
   * width and is clipped — which is how MOVEMENT first rendered as MOVEME.
   */
  anchor?: 'start' | 'middle' | 'end'
  children: string
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={10}
      letterSpacing={1.2}
      textAnchor={anchor}
      className="fill-ink-400 font-sans font-medium"
    >
      {children}
    </text>
  )
}

/** A value that is present but whose content is not the point of the drawing. */
function ValueBar({ x, y, w }: { x: number; y: number; w: number }) {
  return <rect x={x} y={y} width={w} height={6} rx={1} className="fill-ink-200" />
}

/**
 * 01 — Read what actually arrives.
 *
 * Three documents of different kinds on the left, the fields drawn out of them
 * on the right. The fourth field is dashed and labelled NOT FOUND, which is the
 * entry's stated limit drawn rather than merely repeated: without it this is a
 * picture of software that always works.
 */
function Intake() {
  const fields = [
    { label: 'SUPPLIER', w: 168 },
    { label: 'INVOICE DATE', w: 104 },
    { label: 'NET / TAX', w: 140 },
    { label: 'PO REFERENCE', w: 0 },
    { label: 'LINE ITEMS', w: 196 },
  ]

  return (
    <svg viewBox={VIEW_BOX} className="h-auto w-full" role="presentation">
      {/* Three arrivals, stacked and offset: a scan, a spreadsheet, a mail. */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={12 + (2 - i) * 12}
          y={36 + i * 12}
          width={124}
          height={168}
          {...rule}
          fill="none"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ValueBar key={i} x={54} y={62 + i * 22} w={i === 3 ? 50 : 88} />
      ))}

      {/* The extraction. */}
      <path d="M176 132h44" {...emphasis} />
      <path d="M214 127l6 5-6 5" {...emphasis} fill="none" />

      {fields.map((field, i) => {
        const y = 54 + i * 46
        return (
          <g key={field.label}>
            <Caption x={240} y={y}>
              {field.label}
            </Caption>
            {field.w > 0 ? (
              <ValueBar x={240} y={y + 10} w={field.w} />
            ) : (
              <>
                <rect
                  x={240}
                  y={y + 7}
                  width={84}
                  height={11}
                  fill="none"
                  strokeDasharray="3 3"
                  {...rule}
                />
                <Caption x={336} y={y + 16}>
                  NOT FOUND
                </Caption>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * 02 — Match it three ways.
 *
 * The one idea on this page that a drawing explains faster than a sentence:
 * three records, four lines of business, and the single row where the run does
 * not complete. The break is dashed rather than marked in red because there is
 * no red — and having to draw it structurally rather than colour it in turned
 * out to make the better figure anyway.
 */
function Match() {
  const columns = [
    { x: 96, label: 'INVOICE' },
    { x: 216, label: 'PO' },
    { x: 336, label: 'RECEIPT' },
  ]
  const rows = [96, 146, 196, 246]
  /** Matched to the purchase order, never received. */
  const brokenRow = 196

  return (
    <svg viewBox={VIEW_BOX} className="h-auto w-full" role="presentation">
      {columns.map((column) => (
        <g key={column.label}>
          <Caption x={column.x} y={44} anchor="middle">
            {column.label}
          </Caption>
          <path d={`M${column.x} 62v210`} {...rule} strokeDasharray="2 4" fill="none" />
        </g>
      ))}

      {rows.map((y) => {
        const broken = y === brokenRow
        return (
          <g key={y}>
            {/* Invoice to PO agrees on every row here; PO to receipt is where it breaks. */}
            <path d={`M96 ${y}h120`} {...emphasis} />
            <path
              d={`M216 ${y}h120`}
              {...(broken ? rule : emphasis)}
              strokeDasharray={broken ? '4 5' : undefined}
              fill="none"
            />

            {columns.map((column) =>
              broken && column.label === 'RECEIPT' ? (
                <rect
                  key={column.label}
                  x={column.x - 4}
                  y={y - 4}
                  width={8}
                  height={8}
                  fill="none"
                  {...rule}
                />
              ) : (
                <circle key={column.label} cx={column.x} cy={y} r={3.5} className="fill-ink" />
              ),
            )}

            <Caption x={362} y={y + 4}>
              {broken ? 'EXCEPTION' : 'READY TO POST'}
            </Caption>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * 03 — Build the schedule underneath.
 *
 * A ledger closing to a total, with the total enclosed and labelled PREPARED —
 * NOT POSTED. The enclosure is the whole reason this figure exists rather than
 * a picture of a spreadsheet: the sentence beside it promises that nothing
 * posts and no money moves, and a drawing of a finished, posted total would
 * quietly contradict it.
 */
function Schedule() {
  /**
   * Named rows, not five more grey bars.
   *
   * With placeholder bars on both sides this figure was a wireframe — the one
   * drawing in the set that said nothing a blank rectangle would not have said.
   * Naming the lines makes it a schedule, and the names are the ordinary
   * contents of one rather than anything specific to a company.
   *
   * The right-hand column stays abstract on purpose: those are amounts, and
   * there is no honest number to put there.
   */
  const rows = [
    { label: 'ACCRUALS', value: 96 },
    { label: 'PREPAYMENTS', value: 62 },
    { label: 'SUPPLIER STATEMENTS', value: 110 },
    { label: 'PAYMENT RUN', value: 78 },
    { label: 'FX REVALUATION', value: 88 },
  ]

  return (
    <svg viewBox={VIEW_BOX} className="h-auto w-full" role="presentation">
      <Caption x={16} y={40}>
        SCHEDULE
      </Caption>
      <Caption x={464} y={40} anchor="end">
        MOVEMENT
      </Caption>

      {rows.map((row, i) => {
        const y = 70 + i * 32
        return (
          <g key={row.label}>
            <Caption x={16} y={y + 3}>
              {row.label}
            </Caption>
            {/* Right-aligned, the way a movement column always is. */}
            <ValueBar x={464 - row.value} y={y - 4} w={row.value} />
            <path d={`M16 ${y + 13}h448`} {...rule} />
          </g>
        )
      })}

      {/* The closing rule is heavier, the way a ruled column always is. */}
      <path d="M16 224h448" {...emphasis} />

      <rect
        x={8}
        y={236}
        width={464}
        height={38}
        fill="none"
        strokeDasharray="4 4"
        {...rule}
      />
      <Caption x={20} y={259}>
        PREPARED — NOT POSTED
      </Caption>
      <rect x={364} y={251} width={96} height={8} rx={1} className="fill-ink" />
    </svg>
  )
}

/**
 * 04 — Write it up so it can be read.
 *
 * A finished page on the left, the figure it reports on the right, and a leader
 * running between the two. The leader is the point of the drawing: the claim
 * beside it is that every number carries a link back to its evidence, and a
 * page of prose next to a chart would have illustrated "a report" instead.
 *
 * It terminates on a *line inside the page* rather than on a second document
 * icon. The first version drew that icon overlapping the page edge, where it
 * read as a stray rectangle and the leader appeared to point at nothing — which
 * is a worse failure than being plain, because the reader assumes the mistake
 * is theirs.
 */
function Report() {
  /** The tall bar and the dark line in the page are the same figure. */
  const bars = [
    { x: 262, h: 56 },
    { x: 300, h: 86 },
    { x: 338, h: 42 },
    { x: 376, h: 70 },
  ]
  const SOURCED_LINE_Y = 132
  const BASELINE = 246

  return (
    <svg viewBox={VIEW_BOX} className="h-auto w-full" role="presentation">
      <rect x={16} y={36} width={200} height={236} {...rule} fill="none" />

      <rect x={38} y={62} width={100} height={9} rx={1} className="fill-ink" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 92 + i * 20
        // The third line is the figure the chart is reporting, so it is set in
        // the emphasis fill and the leader lands on its end.
        return y === SOURCED_LINE_Y ? (
          <rect key={i} x={38} y={y - 5} width={110} height={7} rx={1} className="fill-ink" />
        ) : (
          <ValueBar key={i} x={38} y={y - 5} w={i === 5 ? 82 : 156} />
        )
      })}
      <path d="M38 214h156" {...rule} />
      <Caption x={38} y={236}>
        SOURCED
      </Caption>

      {/* The figure the page is reporting. */}
      {/* The axis stops just past the last bar. Running it to the drawing
          edge left 64 units of rule pointing at nothing. */}
      <path d={`M250 ${BASELINE}h180`} {...rule} />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={BASELINE - bar.h}
          width={24}
          height={bar.h}
          className={bar.h === 86 ? 'fill-ink' : 'fill-ink-200'}
        />
      ))}
      <Caption x={250} y={268}>
        VARIANCE
      </Caption>

      {/* This bar came from that line. */}
      <path d={`M312 ${BASELINE - 86}V${SOURCED_LINE_Y}H148`} {...emphasis} fill="none" />
      <circle cx={312} cy={BASELINE - 86} r={3.5} className="fill-ink" />
    </svg>
  )
}

/**
 * 05 — Work from the inbox you already have.
 *
 * One thread read top to bottom, with the operator entering it in the middle
 * and the last line filing the reply. Drawn as a thread rather than as a mail
 * client for the reason at the top of this file — and because the thread is the
 * actual claim. There is no second inbox anywhere in the picture, which is
 * precisely what the sentence beside it says.
 */
function Inbox() {
  const messages = [
    { from: 'SUPPLIER', w: 200, indent: 0, mark: false },
    { from: 'YOU', w: 130, indent: 0, mark: false },
    { from: 'INCILLUM', w: 240, indent: 34, mark: true },
    { from: 'SUPPLIER', w: 180, indent: 34, mark: false },
    { from: 'INCILLUM', w: 160, indent: 34, mark: true },
  ]

  return (
    <svg viewBox={VIEW_BOX} className="h-auto w-full" role="presentation">
      {/* The thread itself — one line, unbroken, because that is the argument. */}
      <path d="M24 40v192" {...rule} />

      {messages.map((message, i) => {
        const y = 56 + i * 42
        return (
          <g key={`${message.from}-${i}`}>
            <path d={`M24 ${y}h${18 + message.indent}`} {...rule} />
            {message.mark ? (
              <rect x={20} y={y - 4} width={8} height={8} className="fill-ink" />
            ) : (
              <circle cx={24} cy={y} r={3.5} className="fill-ink-200" />
            )}
            <Caption x={56 + message.indent} y={y - 8}>
              {message.from}
            </Caption>
            <ValueBar x={56 + message.indent} y={y - 1} w={message.w} />
          </g>
        )
      })}

      <path d="M16 254h448" {...rule} strokeDasharray="4 4" fill="none" />
      <Caption x={16} y={276}>
        FILED AGAINST THE CASE
      </Caption>
    </svg>
  )
}

/**
 * The figures, by name.
 *
 * Keyed rather than exported individually so `content/site.ts` can name the
 * drawing that belongs beside each capability, and the two lists stay together
 * in one place instead of in an import order nobody checks.
 */
export const figures: Record<string, () => ReactElement> = {
  intake: Intake,
  match: Match,
  schedule: Schedule,
  report: Report,
  inbox: Inbox,
}

export type FigureName = keyof typeof figures
