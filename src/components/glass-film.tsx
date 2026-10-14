import { useRef, useState } from 'react'

import { Container } from '#/components/primitives.tsx'
import { evidence, glass, home, thread } from '#/content/site.ts'
import { useHydrated, useInView, useReducedMotion } from '#/lib/motion.ts'

import type { GlassStatus, MatrixStatus } from '#/content/site.ts'
import type { AnimationEvent } from 'react'

/**
 * The film — one night, played in a frame under the hero.
 *
 * ── What it is ─────────────────────────────────────────────────────────────
 *
 * The night thread at another magnification, which is the only kind of second
 * look this site allows itself. On the left, the hour and what happened in it.
 * On the right, one sheet — the matrix's own rows — that changes state as the
 * night goes: unread at 23:47, read at 00:06, two lines held at 01:18, a cost
 * moved at 03:42, the ledger at 06:50, a person at 08:04. Where a source lands
 * on the sheet, a chip says which one, and it stays: every figure keeps the page
 * it came from, so the provenance accumulates rather than flashing past.
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
 * It plays once and stops at 08:04 — the morning is the end, and a night that
 * restarts itself is a screensaver. It waits for the opening to finish and for
 * the frame to be on screen, pauses when it leaves, and the reader can pause it.
 * Under reduced motion it never plays; the hours are chapters to step through.
 *
 * Without JavaScript every hour is listed and the sheet shows the morning,
 * which is the whole story in the server's HTML. The licence — `Illustrative`
 * and `invented` — is the frame's first two lines either way.
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
    if (chip) return { text: chip.text, fresh: hour === stage }
  }
  return null
}

export function GlassFilm({ ready }: { ready: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  const inView = useInView(frameRef, 0.45)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [ended, setEnded] = useState(false)
  /** Bumped to restart the hairline when a chapter is chosen or the night is replayed. */
  const [take, setTake] = useState(0)

  const autoplay = hydrated && !reduced
  const running = autoplay && ready && playing && inView && !ended
  /** Without a script the sheet shows the morning, beside the whole night listed. */
  const stage = hydrated ? index : LAST

  function advance(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName !== 'glass-progress') return
    if (index < LAST) {
      setIndex(index + 1)
      return
    }
    setPlaying(false)
    setEnded(true)
  }

  function choose(hour: number) {
    setIndex(hour)
    setEnded(false)
    setTake((count) => count + 1)
  }

  function toggle() {
    if (ended) {
      setIndex(0)
      setEnded(false)
      setPlaying(true)
      setTake((count) => count + 1)
      return
    }
    setPlaying(!playing)
  }

  const control = ended
    ? film.controls.replay
    : playing
      ? film.controls.pause
      : film.controls.play

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
          {/*
            The licence, first, in the server's HTML: the label names it and the
            line under it says it is invented, at reading size.
          */}
          <div className="glass-film-head">
            <h2 id="film-label" className="glass-film-label">
              {film.label}
            </h2>
            <p className="glass-film-lede">{film.lede}</p>
          </div>

          <div className="glass-film-body">
            {/*
              Polite while the reader is driving, silent while it plays itself —
              an announcement every few seconds would talk over everything else.
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
                  onClick={toggle}
                >
                  <PlayIcon state={ended ? 'replay' : playing ? 'pause' : 'play'} />
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
                    data-done={
                      hour < index || (ended && hour === index) ? 'true' : 'false'
                    }
                    onClick={() => choose(hour)}
                  >
                    <span className="glass-chapter-track" aria-hidden="true">
                      {hour === index && !ended && autoplay ? (
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
 * The sheet under the lamp, at one hour of the night.
 *
 * A list rather than the home page's table: it is an illustration of the
 * matrix changing, read one row at a time, and on a phone each row wraps its
 * source under the item — which a table cannot do without losing its semantics.
 * The real table, with every column, is on the home page.
 */
function Sheet({ stage }: { stage: number }) {
  const head = chipAt('head', stage)

  return (
    <div data-lit="" className="glass-sheet" data-stage={stage}>
      <div className="glass-sheet-bar">
        <p className="glass-sheet-title">
          <span className="matrix-mark" aria-hidden="true" />
          {film.title}
        </p>
        {head ? <Chip key={head.text} text={head.text} fresh={head.fresh} /> : null}
      </div>

      <ol className="glass-sheet-rows">
        {home.matrix.rows.map((row) => {
          const status = statusAt(row.status, stage)
          const chip = chipAt(row.line, stage)
          return (
            <li
              key={row.line}
              className="glass-sheet-row"
              data-status={status ?? 'unread'}
              data-fresh={chip?.fresh ? 'true' : undefined}
            >
              <span className="glass-sheet-line ic-tabular">{row.line}</span>
              <span className="glass-sheet-item">
                <span className="glass-sheet-text">{row.item}</span>
                <span className="glass-skeleton" aria-hidden="true" />
              </span>
              <span className="glass-sheet-source">
                {chip ? (
                  <Chip key={chip.text} text={chip.text} fresh={chip.fresh} />
                ) : null}
              </span>
              <span className="glass-sheet-status">
                {status ? (
                  <span
                    key={status}
                    className={`matrix-status matrix-status--${status} glass-status`}
                  >
                    {film.statusLabels[status]}
                  </span>
                ) : (
                  <span
                    className="glass-skeleton glass-skeleton--status"
                    aria-hidden="true"
                  />
                )}
              </span>
            </li>
          )
        })}
        <li className="glass-sheet-row glass-sheet-more">
          <span className="glass-sheet-line" aria-hidden="true" />
          <span className="glass-sheet-item">
            <span className="ic-tabular">{home.matrix.more.count}</span> {film.more}
          </span>
        </li>
      </ol>

      <Foot stage={stage} />
    </div>
  )
}

/**
 * The foot: a line about where the night is, until 06:50, and the ledger after.
 *
 * Both layers are always rendered and stacked in one cell, so the sheet is as
 * tall at 23:47 as it is at 08:04 and nothing under the film moves while it
 * plays. The hidden one is hidden from a screen reader as well as from sight.
 */
function Foot({ stage }: { stage: number }) {
  const priced = stage >= LEDGER
  const floorChip = chipAt('floor', stage)
  const scale = evidence.visual.scaleMax

  return (
    <div className="glass-sheet-foot" data-ledger={priced ? 'true' : 'false'}>
      <div className="glass-sheet-notes" aria-hidden={priced}>
        {film.frames.map((frame, hour) =>
          frame.note ? (
            <p key={frame.at} data-active={hour === stage ? 'true' : 'false'}>
              {frame.note}
            </p>
          ) : null,
        )}
        <span className="glass-skeleton glass-skeleton--wide" aria-hidden="true" />
        <span className="glass-skeleton" aria-hidden="true" />
      </div>

      <div className="glass-sheet-ledger" aria-hidden={!priced}>
        {/*
          The matrix's own summary, in the same words: the quote, and its margin
          against the floor. Proportional figures — the serif's tabular ones are
          set for columns, and these are read one at a time.
        */}
        <dl className="glass-sheet-figures">
          <div>
            <dt>{quote?.term}</dt>
            <dd>{quote?.value}</dd>
          </div>
          <div>
            <dt>{margin?.term}</dt>
            <dd>
              {margin?.value}
              <span>
                {' '}
                · {home.matrix.summary.floor} {floor?.value}
              </span>
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
            {floorChip ? <Chip text={floorChip.text} fresh={floorChip.fresh} /> : null}
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
          <p className="glass-sheet-short">
            <span>{short.term}</span>
            <strong>{short.value}</strong>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** A source, landed on the sheet. The newest one is drawn in ink; older ones step back. */
function Chip({ text, fresh }: { text: string; fresh: boolean }) {
  return (
    <span className="glass-chip" data-fresh={fresh ? 'true' : 'false'}>
      {text}
    </span>
  )
}

/** Sixteen-pixel glyphs on `currentColor`. Three of them do not earn a package. */
function PlayIcon({ state }: { state: 'play' | 'pause' | 'replay' }) {
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
  if (state === 'replay') {
    return (
      <svg {...common}>
        <path
          d="M3.5 8a4.5 4.5 0 1 0 1.32-3.18M3.5 2.75v2.5H6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
