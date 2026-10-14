import { useEffect, useRef, useState } from 'react'

import { Container, Label } from '#/components/primitives.tsx'
import { glass, home, thread } from '#/content/site.ts'
import { useObservable } from '#/lib/motion.ts'

import type { GlassPieceKey } from '#/content/site.ts'

/**
 * Six sources, then one thread.
 *
 * ── The scene ──────────────────────────────────────────────────────────────
 *
 * The section pins while the reader scrolls through it, and changes once. First
 * the six documents one quotation is assembled from, lying where they lie — a
 * mailbox, a drawing pack, a catalogue, a price list, an agreement and a
 * supplier's reply — with the dashed lines a person draws between them by hand.
 * Then they gather into one thread: each source on its own line, a wire into the
 * quotation, and what it became there. The second picture is the structure of
 * the product, stated as a diagram rather than a feature list.
 *
 * It is the matrix again, at a third magnification, so every line number,
 * state and figure on it is the matrix's or the 06:50 ledger's, read here and
 * never written down twice.
 *
 * ── Why one change, and why a threshold ────────────────────────────────────
 *
 * The scene changes when a sentinel 38% of the way down the section crosses
 * the middle of the viewport, which an IntersectionObserver reports as a
 * boolean — no scroll listener, two renders over the whole section. The change
 * is a CSS transition, so it is the same at any scroll speed, and scrolling
 * back up undoes it.
 *
 * It only pins where the whole stage fits on screen — wide enough for the
 * thread's three columns and tall enough for it to sit under both headlines.
 * Everywhere else (a phone, whose visible height with the browser's bars is
 * nearer 660px than 844px; a short laptop window; a page with no script or no
 * observer) the same two pictures are stacked and read downwards: the problem,
 * then the thread. Under reduced motion the pinned swap is instant.
 */

const { sources } = glass

/** Where a piece lies on the desk: centre x and y in percent of the figure, and a turn in degrees. */
type Placement = readonly [x: number, y: number, turn: number]

const desk: Record<GlassPieceKey, { wide: Placement; narrow: Placement }> = {
  request: { wide: [16, 25, -4], narrow: [28, 11, -3] },
  drawing: { wide: [44, 19, 3], narrow: [72, 25, 3] },
  catalogue: { wide: [81, 26, -2], narrow: [29, 40, -2] },
  prices: { wide: [21, 73, 2], narrow: [71, 55, 2] },
  agreement: { wide: [54, 67, -3], narrow: [29, 70, -2] },
  supplier: { wide: [84, 75, 4], narrow: [70, 86, 3] },
}

/** The lines a person draws between them. Deliberately a tangle. */
const tangle: ReadonlyArray<readonly [GlassPieceKey, GlassPieceKey]> = [
  ['request', 'drawing'],
  ['request', 'prices'],
  ['drawing', 'catalogue'],
  ['catalogue', 'agreement'],
  ['prices', 'agreement'],
  ['supplier', 'prices'],
  ['agreement', 'supplier'],
  ['request', 'agreement'],
  ['drawing', 'supplier'],
]

/** A loose arc between two pieces, bowed alternately either side. */
function arc(from: Placement, to: Placement, bow: number) {
  const [x1, y1] = from
  const [x2, y2] = to
  const mx = (x1 + x2) / 2 + bow
  const my = (y1 + y2) / 2 - bow
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
const short = ledger.find((entry) => entry.breaches)
const titleOf = Object.fromEntries(
  sources.pieces.map((piece) => [piece.key, piece.title]),
) as Record<GlassPieceKey, string>

export function GlassSources() {
  const observable = useObservable()
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [gathered, setGathered] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    /**
     * The root is everything above the middle of the screen — the top half of
     * the viewport, and far beyond it upwards — so the sentinel is inside it
     * exactly when it has been scrolled past the middle. An observer reports a
     * change of state, not a position: with a root only half a screen tall, a
     * jump from above the sentinel to well below it (an anchor, a Home key, a
     * long fling) never intersects and is never reported. With this one, every
     * crossing of the middle flips it, whichever way and however fast.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setGathered(entry.boundingClientRect.top < window.innerHeight / 2)
      },
      { rootMargin: '100000px 0px -50% 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const phase = observable && !gathered ? 'scattered' : 'gathered'

  return (
    <section
      className="glass-sources desk"
      aria-labelledby="sources-title"
      data-enhanced={observable ? 'true' : 'false'}
      data-phase={phase}
    >
      <span ref={sentinelRef} className="glass-sources-sentinel" aria-hidden="true" />

      {/*
        One grid, two arrangements. Pinned (wide and tall enough to hold it):
        both headlines share a row, the desk and the thread share another, and
        the phase decides which of each is showing. Stacked (a phone, a short
        laptop, no script): headline, desk, headline, thread — the same before
        and after, read downwards instead of changing in place.
      */}
      <div className="glass-sources-stage">
        <Container className="glass-sources-grid">
          <Label className="glass-sources-label">{sources.label}</Label>
          <div className="glass-sources-title" data-for="scattered">
            <h2 id="sources-title" className="glass-heading">
              {sources.scattered.headline}
            </h2>
            <p className="glass-sources-lede">{sources.scattered.lede}</p>
          </div>
          <div className="glass-sources-title" data-for="gathered">
            <h2 className="glass-heading">{sources.gathered.headline}</h2>
            <p className="glass-sources-lede">{sources.gathered.lede}</p>
          </div>

          {/*
            A picture of the problem rather than information — every source it
            shows is named again, with what it became, in the thread below —
            so it is hidden from a screen reader, which hears the thread.
          */}
          <div className="glass-desk-figure" aria-hidden="true">
            {(['wide', 'narrow'] as const).map((size) => (
              <svg
                key={size}
                className={`glass-tangle glass-tangle--${size}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                focusable="false"
              >
                {tangle.map(([from, to], index) => (
                  <path
                    key={`${from}-${to}`}
                    d={arc(desk[from][size], desk[to][size], index % 2 === 0 ? 7 : -6)}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            ))}

            <ul className="glass-pieces">
              {sources.pieces.map((piece, index) => {
                const { wide, narrow } = desk[piece.key]
                return (
                  <li
                    key={piece.key}
                    className="glass-piece"
                    data-kind={piece.key}
                    style={{
                      ['--i' as string]: index,
                      ['--x-wide' as string]: wide[0],
                      ['--y-wide' as string]: wide[1],
                      ['--turn-wide' as string]: wide[2],
                      ['--x-narrow' as string]: narrow[0],
                      ['--y-narrow' as string]: narrow[1],
                      ['--turn-narrow' as string]: narrow[2],
                    }}
                  >
                    <p className="glass-piece-title">{piece.title}</p>
                    <p className="glass-piece-detail">{piece.detail}</p>
                    <PieceArt kind={piece.key} />
                    <span className="glass-piece-flag">{piece.flag}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <Thread />
        </Container>
      </div>
    </section>
  )
}

/**
 * The gathered picture: each source on its own line, a wire into the
 * quotation, and what it became there. A list of rows on a shared grid, so the
 * sources, the wires and the quotation's cells line up without being measured.
 */
function Thread() {
  const { lines } = home.matrix

  return (
    <div data-lit="" className="glass-thread">
      <p className="glass-thread-title">
        <span className="matrix-mark" aria-hidden="true" />
        {home.matrix.title}
      </p>

      <ol className="glass-thread-rows">
        {sources.thread.map((row, index) => (
          <li
            key={row.key}
            className="glass-thread-row"
            style={{ ['--i' as string]: index }}
          >
            <span className="glass-thread-source">{titleOf[row.key]}</span>
            <span className="glass-thread-wire" aria-hidden="true" />
            <span className="glass-thread-cell">
              {row.line ? (
                <span className="glass-thread-line ic-tabular">
                  {sources.lines} {row.line}
                </span>
              ) : null}
              <span className="glass-thread-text">{row.text}</span>
              {row.status ? (
                <span className={`matrix-status matrix-status--${row.status}`}>
                  {home.matrix.statusLabels[row.status]}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      <div className="glass-thread-foot">
        <p className="glass-thread-count">
          {lines.priced}/{lines.total} {sources.priced} · {lines.held} {sources.held} ·{' '}
          {home.matrix.summary.margin} {figure('Expected margin')},{' '}
          {home.matrix.summary.floor} {figure('Commercial floor')}
        </p>
        {short ? (
          <p className="glass-thread-short">
            <span>{short.term}</span>
            <strong>{short.value}</strong>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * What each document looks like from across the desk: the shape of the page,
 * never its words. Bars stand in for text, so nothing here is legible enough to
 * be read as a claim — the same rule the night plate's photograph was shot to.
 */
function PieceArt({ kind }: { kind: GlassPieceKey }) {
  if (kind === 'drawing') {
    return (
      <svg
        className="glass-piece-art glass-piece-drawing"
        viewBox="0 0 120 56"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="14" y="10" width="54" height="30" />
        <circle cx="30" cy="25" r="6" />
        <circle cx="52" cy="25" r="6" />
        <path d="M14 48h54M14 45v6M68 45v6" />
        <rect className="glass-piece-titleblock" x="80" y="30" width="34" height="20" />
        <path d="M80 40h34M97 30v20" />
      </svg>
    )
  }
  if (kind === 'prices') {
    return (
      <span className="glass-piece-art glass-piece-grid">
        {Array.from({ length: 12 }, (_, cell) => (
          <span key={cell} className="glass-skeleton" />
        ))}
      </span>
    )
  }
  if (kind === 'catalogue') {
    return (
      <span className="glass-piece-art glass-piece-entries">
        {[0, 1, 2].map((entry) => (
          <span key={entry} className="glass-piece-entry">
            <span className="glass-piece-entry-mark" />
            <span className="glass-skeleton" />
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className="glass-piece-art glass-piece-lines">
      <span className="glass-skeleton" />
      <span className="glass-skeleton" />
      {kind === 'agreement' ? <span className="glass-skeleton" /> : null}
    </span>
  )
}
