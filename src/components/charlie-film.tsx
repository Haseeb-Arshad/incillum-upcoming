import { useRef, useState } from 'react'

import { OrbitMark } from '#/components/orbit-mark.tsx'
import { SourceIcon } from '#/components/glass-documents.tsx'
import { charlie, glass, home, thread } from '#/content/site.ts'
import { useHydrated, useInView, useReducedMotion } from '#/lib/motion.ts'

import type { GlassSource } from '#/content/site.ts'
import type { AnimationEvent } from 'react'

/**
 * Charlie, at work — the film on the front page.
 *
 * ── What it is ─────────────────────────────────────────────────────────────
 *
 * Six of Charlie's abilities, one beat each, played round in a frame: reads
 * what arrives, cites every source, holds what it cannot settle, makes the
 * documents, tells the team, asks before anything leaves. Beside the frame the
 * six are listed, a title and one line each, and the one playing fills its
 * hairline — the reference pages' product rail, set going.
 *
 * It is built, not filmed, for the reason the documents are: a recorded or
 * generated screen is soft at the size a reader leans in to, and its text is
 * nonsense. Every figure in the frame is read here from the documents, the
 * matrix and the 06:50 ledger, so the film cannot disagree with the night.
 *
 * ── How it moves, and when it does not ─────────────────────────────────────
 *
 * Each beat runs for `--cf-beat`, timed by its own hairline: the hairline's
 * `animationend` advances the film, and after the last beat it goes round.
 * Three scenes carry the six beats — the sheet (reads, cites, holds), the
 * document (makes) and the channel (tells, asks) — so the sheet stays on the
 * stage while it fills, and only a change of scene crossfades. It plays only
 * while it is on screen, the reader can pause it or choose a beat, and under
 * reduced motion it never plays: the beats are chapters, each at its final
 * frame. Without a script the frame shows the sheet with its lines held.
 *
 * The frame restates what the list says, so it is hidden from a screen reader,
 * which reads the six abilities.
 */

const { film } = charlie
const steps = film.steps
type StepKey = (typeof steps)[number]['key']
const scenes: Record<StepKey, 'sheet' | 'document' | 'channel'> = {
  reads: 'sheet',
  cites: 'sheet',
  holds: 'sheet',
  makes: 'document',
  tells: 'channel',
  asks: 'channel',
}

const { documents } = glass.sources
const { sheet } = glass.film
const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
const shortfall = ledger.find((entry) => entry.breaches)
const cost = documents.supplier.changes.find((change) => change.term === 'Unit cost')

/** The five lines the sheet shows: two priced, the two held, and the one that moves. */
const rows = home.matrix.rows.filter((row) =>
  ['01', '04', '05', '11', '14'].includes(row.line),
)

/** A line's rate, read off the document row it names — or none, for a held line. */
function rate(line: string): string | null {
  const source = (
    sheet.lines as Record<string, { rate?: { from: string; part: string } }>
  )[line]?.rate
  if (!source) return null
  if (source.from === 'prices')
    return documents.prices.rows.find((row) => row.part === source.part)?.cost ?? null
  for (const clause of documents.agreement.clauses) {
    if ('rates' in clause) {
      const found = clause.rates.find((entry) => entry.part === source.part)
      if (found) return found.rate
    }
  }
  return null
}
const quantity = (line: string) =>
  (sheet.lines as Record<string, { quantity: string }>)[line]?.quantity ?? ''

const tokens: Record<string, string> = {
  line: home.matrix.rows.find((row) => row.status === 'changed')?.line ?? '',
  priced: String(home.matrix.lines.priced),
  held: String(home.matrix.lines.held),
  units: quantity('14'),
  part: documents.prices.moving,
  margin: figure('Expected margin'),
  floor: figure('Commercial floor'),
}
const fill = (text: string) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? '')
const ready = charlie.scene.messages.find(
  (message) => message.at === thread.beats.at(-1)?.at,
)
const ask = charlie.scene.messages.find((message) => message.ask)

export function CharlieFilm() {
  const frameRef = useRef<HTMLDivElement>(null)
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  const inView = useInView(frameRef, 0.35)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  /** Bumped to restart a beat's hairline and its scene when a beat is chosen. */
  const [take, setTake] = useState(0)

  const autoplay = hydrated && !reduced
  const running = autoplay && playing && inView
  // Without a script, the sheet with its lines held: the most the frame can say at once.
  const current = (hydrated ? steps[index] : steps[2]) ?? steps[0]

  function advance(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName !== 'cf-progress') return
    setIndex((value) => (value + 1) % steps.length)
  }

  function choose(next: number) {
    setIndex(next)
    setTake((value) => value + 1)
  }

  return (
    <div
      ref={frameRef}
      className="cf"
      data-enhanced={hydrated ? 'true' : 'false'}
      data-running={running ? 'true' : 'false'}
    >
      <div className="cf-rail">
        <p className="cf-licence">{film.licence}</p>
        <ol className="cf-steps" aria-label={film.controls.steps}>
          {steps.map((step, number) => {
            const active = step.key === current.key
            return (
              <li
                key={step.key}
                className="cf-step"
                data-active={active ? 'true' : 'false'}
              >
                {hydrated ? (
                  <button
                    type="button"
                    className="cf-step-button"
                    aria-current={active ? 'step' : undefined}
                    onClick={() => choose(number)}
                  >
                    <StepText step={step} />
                  </button>
                ) : (
                  <span className="cf-step-button">
                    <StepText step={step} />
                  </span>
                )}
                <span className="cf-step-track" aria-hidden="true">
                  {active && autoplay ? (
                    <span
                      key={`${take}-${number}`}
                      className="cf-step-fill cf-step-fill--live"
                      onAnimationEnd={advance}
                    />
                  ) : (
                    <span className="cf-step-fill" />
                  )}
                </span>
              </li>
            )
          })}
        </ol>
        {autoplay ? (
          <button
            type="button"
            className="cf-play"
            aria-label={playing ? film.controls.pause : film.controls.play}
            onClick={() => setPlaying(!playing)}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              {playing ? (
                <path
                  d="M5.5 3.5v9M10.5 3.5v9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M5 3.25v9.5L12.5 8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            {playing ? film.controls.pause : film.controls.play}
          </button>
        ) : null}
      </div>

      <div
        key={take}
        data-lit=""
        className="cf-stage"
        data-step={current.key}
        data-scene={scenes[current.key]}
        aria-hidden="true"
      >
        {/* The desk, from above, in the morning: the paper the agent works on lies on it. */}
        <picture className="cf-desk">
          <source
            type="image/avif"
            sizes="(min-width: 64rem) 60vw, 100vw"
            srcSet="/how/desk-morning-720.avif 720w, /how/desk-morning-1120.avif 1120w, /how/desk-morning-1600.avif 1600w"
          />
          <source
            type="image/webp"
            sizes="(min-width: 64rem) 60vw, 100vw"
            srcSet="/how/desk-morning-720.webp 720w, /how/desk-morning-1120.webp 1120w, /how/desk-morning-1600.webp 1600w"
          />
          <img
            src="/how/desk-morning-1600.jpg"
            alt=""
            width={1600}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <SheetScene />
        <DocumentScene />
        <ChannelScene />
      </div>
    </div>
  )
}

function StepText({ step }: { step: (typeof steps)[number] }) {
  return (
    <>
      <span className="cf-step-title">{step.title}</span>
      <span className="cf-step-line">{step.line}</span>
    </>
  )
}

/** Where a line's rate was read from, as the sheet cites it. */
function source(line: string): GlassSource | null {
  const from = (sheet.lines as Record<string, { rate?: { from: string } }>)[line]?.rate?.from
  return from === 'prices' || from === 'agreement' ? from : null
}

/** A citation: the icon of the document a figure was read from, set after the figure. */
function Cite({ from }: { from: GlassSource }) {
  return (
    <span className="cf-cite" data-source={from}>
      <SourceIcon source={from} />
    </span>
  )
}

/**
 * Reads, cites, holds. The request's PDF is read and its lines are written into
 * the sheet; every rate is written with the page it came from; the supplier's
 * answer moves one, and its page opens on the line; two lines are held.
 */
function SheetScene() {
  const request = documents.request
  const supplier = documents.supplier
  const pdf = request.attachments.find((file) => file.format === 'PDF') ?? request.attachments[0]
  return (
    <div className="cf-scene cf-scene--sheet">
      <div className="cf-card cf-mail">
        <p className="cf-card-bar">
          <SourceIcon source="request" />
          <span>{request.title}</span>
          <span className="cf-quiet">{request.at}</span>
        </p>
        <p className="cf-mail-subject">{request.subject}</p>
        <p className="cf-quiet">{request.address}</p>
        <div className="cf-reading">
          <span className="cf-pdf">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span className="cf-scan" />
          </span>
          <span className="cf-reading-text">
            <span className="cf-reading-now">
              {film.stage.reading} {pdf?.name}
            </span>
            <span className="cf-reading-done">
              {home.matrix.lines.total} {film.stage.read}
            </span>
            <span className="cf-reading-bar">
              <span />
            </span>
          </span>
        </div>
        <p className="cf-files">
          {request.attachments.map((file) => (
            <span key={file.name}>{file.name}</span>
          ))}
        </p>
      </div>

      <div className="cf-card cf-confirmation">
        <p className="cf-card-bar">
          <SourceIcon source="supplier" />
          <span>{supplier.title}</span>
          <span className="cf-quiet">{supplier.at}</span>
        </p>
        <p className="cf-mail-subject">{supplier.item}</p>
        <p className="cf-change">
          <span className="cf-quiet">{cost?.term}</span>
          <s>{cost?.was}</s>
          <span aria-hidden="true">→</span>
          <mark className="cf-mark">{cost?.now}</mark>
        </p>
      </div>

      <div className="cf-card cf-sheet">
        <p className="cf-card-bar">
          <span className="matrix-mark" />
          <span>{film.stage.sheet}</span>
          <span className="cf-quiet">{home.matrix.lines.total}</span>
        </p>
        <table className="cf-table">
          <tbody>
            {rows.map((row, number) => {
              const moved = row.status === 'changed'
              const value = rate(row.line)
              const from = source(row.line)
              return (
                <tr
                  key={row.line}
                  data-status={row.status}
                  style={{ ['--cf-row' as string]: number }}
                >
                  <td className="cf-line">{row.line}</td>
                  <td className="cf-item">
                    <span className="cf-write">{row.item}</span>
                  </td>
                  <td className="cf-qty">
                    <span className="cf-write">{quantity(row.line)}</span>
                  </td>
                  <td className="cf-rate">
                    {moved ? (
                      <span className="cf-rate-swap">
                        <span className="cf-rate-before">
                          {cost?.was}
                          {from ? <Cite from={from} /> : null}
                        </span>
                        <span className="cf-rate-moved">
                          <s>{cost?.was}</s> {cost?.now}
                          <Cite from="supplier" />
                        </span>
                      </span>
                    ) : (
                      <span>
                        {value ?? '—'}
                        {value && from ? <Cite from={from} /> : null}
                      </span>
                    )}
                  </td>
                  <td className="cf-status">
                    <span className={`matrix-status matrix-status--${row.status}`}>
                      {home.matrix.statusLabels[row.status]}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* The page the moved figure was read from, opened on the line it changed. */}
        <div className="cf-source">
          <p className="cf-source-bar">
            <SourceIcon source="supplier" />
            <span>{supplier.title}</span>
            <span className="cf-quiet">{supplier.at}</span>
          </p>
          <p className="cf-source-line">
            <span className="cf-quiet">{cost?.term}</span>
            <span>
              <s>{cost?.was}</s> <span aria-hidden="true">→</span>{' '}
              <mark className="cf-mark">{cost?.now}</mark>
            </span>
          </p>
          <p className="cf-quiet">{supplier.note}</p>
        </div>
        <svg className="cf-cursor" viewBox="0 0 20 20" focusable="false">
          <path d="M4 2.5l11 8.25-5 .75 2.75 5.75-2.25 1-2.75-5.75-3.75 3.25z" />
        </svg>
      </div>
    </div>
  )
}

/** Makes: the quotation is drafted from the lines, with its working and what is still held. */
function DocumentScene() {
  return (
    <div className="cf-scene cf-scene--document">
      <div className="cf-page">
        <p className="cf-page-head">
          <span>{film.stage.quotation}</span>
          <span className="cf-quiet">
            {/RFQ \d+/.exec(documents.request.subject)?.[0]}
          </span>
        </p>
        <p className="cf-page-to">{documents.request.from}</p>
        <dl className="cf-page-figures">
          <div>
            <dt>{home.matrix.summary.priced}</dt>
            <dd>
              {home.matrix.lines.priced} / {home.matrix.lines.total}
            </dd>
          </div>
          <div>
            <dt>{home.matrix.summary.held}</dt>
            <dd className="cf-held">{home.matrix.lines.held}</dd>
          </div>
          <div>
            <dt>{home.matrix.summary.value}</dt>
            <dd>{figure('Quote value')}</dd>
          </div>
          <div>
            <dt>{home.matrix.summary.margin}</dt>
            <dd>
              {figure('Expected margin')} · {home.matrix.summary.floor}{' '}
              {figure('Commercial floor')}
            </dd>
          </div>
        </dl>
        {shortfall ? (
          <p className="cf-short">
            <span>{shortfall.term}</span>
            <strong>{shortfall.value}</strong>
          </p>
        ) : null}
        <p className="cf-stamp">{film.stage.prepared}</p>
      </div>
    </div>
  )
}

/** Tells, asks: Charlie posts to the channel, a request waits for an approval, and is sent. */
function ChannelScene() {
  const { people } = charlie.scene
  return (
    <div className="cf-scene cf-scene--channel">
      <div className="cf-card cf-channel">
        <p className="cf-card-bar">
          <span className="cf-hash">{charlie.scene.channel}</span>
        </p>
        <div className="cf-message cf-message--ready">
          <span className="cf-avatar cf-avatar--charlie">
            <OrbitMark className="cf-avatar-mark" />
          </span>
          <div>
            <p className="cf-message-head">
              {people.charlie.name} <span className="cf-quiet">{ready?.at}</span>
            </p>
            <p className="cf-typing">
              <span />
              <span />
              <span />
            </p>
            <p className="cf-message-text">{ready ? fill(ready.text) : null}</p>
          </div>
        </div>
        {ask?.ask ? (
          <div className="cf-message cf-message--ask">
            <span className="cf-avatar cf-avatar--charlie">
              <OrbitMark className="cf-avatar-mark" />
            </span>
            <div>
              <p className="cf-message-head">
                {people.charlie.name} <span className="cf-quiet">{ask.at}</span>
              </p>
              <div className="cf-ask">
                <p className="cf-ask-title">{fill(ask.ask.title)}</p>
                <p className="cf-quiet">{fill(ask.ask.detail)}</p>
                <p className="cf-ask-answers">
                  <span className="cf-approve">{ask.ask.approve}</span>
                  <span className="cf-other">{ask.ask.other}</span>
                </p>
                <p className="cf-decided">
                  {ask.decided} · {film.stage.sent}
                </p>
              </div>
            </div>
            <svg className="cf-pointer" viewBox="0 0 20 20" focusable="false">
              <path d="M4 2.5l11 8.25-5 .75 2.75 5.75-2.25 1-2.75-5.75-3.75 3.25z" />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  )
}
