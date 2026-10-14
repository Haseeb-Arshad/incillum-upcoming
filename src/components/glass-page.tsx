import { useEffect, useRef, useState } from 'react'

import { GlassFilm } from '#/components/glass-film.tsx'
import { GlassSources } from '#/components/glass-sources.tsx'
import { ButtonLink, Container, Label, TextLink } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, glass, home, thread } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

/**
 * /glass — the presentation.
 *
 * ── The acts ───────────────────────────────────────────────────────────────
 *
 * 1. **The opening.** The night, a field of hour rules drawing down it, and two
 *    beats of type. Then the page assembles.
 * 2. **The hero.** Centred: the stage, the headline, the home page's form.
 * 3. **The film.** One request carried from 23:47 to 08:04 in a frame, the
 *    sheet changing state as the hours pass (`glass-film.tsx`).
 * 4. **Six sources.** The documents a quotation is assembled from, scattered,
 *    then gathered into one thread (`glass-sources.tsx`).
 * 5. **Rules.** The night as it is meant to run, drawn as a flowchart.
 * 6. **The morning.** The same night as a timeline, from the hour the office
 *    empties to the decision waiting at 08:04.
 * 7. **The close.** Where the build stands, and one invitation.
 *
 * Acts one to three are the page's one `[data-inverted]` region. The film ends
 * at 08:04 and the page turns to paper with it.
 *
 * ── Its motion budget, which is larger than the home page's ────────────────
 *
 * This page is a presentation, and in a presentation the movement is the
 * telling. So it gets more than the home page's five moving things, and they
 * are listed in `styles.css` above the block that implements them, so the list
 * can only grow on purpose. What it shares with every other page: nothing
 * loops, nothing pulses, nothing moves while the reader is still once the film
 * has stopped, and `prefers-reduced-motion` gets the final frame of everything.
 *
 * ── The opening, and how it ends ───────────────────────────────────────────
 *
 * It is CSS, so it plays and ends with no script at all. With one, any input —
 * a key, a click, a wheel, a touch — ends it early and the page arrives at
 * once. The film waits for it either way, so the first hour is never spent
 * behind the dark.
 */

type Opening = 'playing' | 'skipped' | 'ended'

/** Minutes after the office empties, wrapping past midnight. */
function minutesAfter(start: string, at: string): number {
  const toMinutes = (time: string) => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  return (toMinutes(at) - toMinutes(start) + 24 * 60) % (24 * 60)
}

const lastBeat = thread.beats[thread.beats.length - 1]
const nightLength = minutesAfter(
  glass.morning.leave.at,
  lastBeat?.at ?? glass.morning.leave.at,
)
/** One rule per whole hour of the night, from the hour the office empties to the morning. */
const nightHours = Math.floor(nightLength / 60) + 1

export function GlassPage() {
  const openingRef = useRef<HTMLDivElement>(null)
  const [opening, setOpening] = useState<Opening>('playing')

  useEffect(() => {
    if (opening !== 'playing') return
    const skip = () => setOpening('skipped')
    const inputs = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const
    for (const input of inputs) window.addEventListener(input, skip, { passive: true })
    return () => {
      for (const input of inputs) window.removeEventListener(input, skip)
    }
  }, [opening])

  /**
   * The opening's natural end, read off its own animations rather than a timer
   * that would have to agree with the stylesheet. If the page hydrated after
   * they had already finished, their promises are already settled; under
   * reduced motion there are none, and the opening is over before it began.
   */
  useEffect(() => {
    const element = openingRef.current
    if (!element || opening !== 'playing') return
    let current = true
    const animations =
      typeof element.getAnimations === 'function'
        ? element.getAnimations({ subtree: true })
        : []
    void Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        if (current) setOpening((state) => (state === 'playing' ? 'ended' : state))
      },
      // Cancelled because the reader skipped it, which has already been recorded.
      () => {},
    )
    return () => {
      current = false
    }
  }, [opening])

  return (
    <div className="glass" data-opening={opening}>
      <div data-inverted="" className="glass-night">
        <div className="glass-hours" aria-hidden="true">
          {Array.from({ length: nightHours }, (_, hour) => (
            <span key={hour} style={{ ['--i' as string]: hour }} />
          ))}
        </div>

        {/*
          Decoration, as far as a screen reader is concerned: the two beats set
          a scene the hero then states, and they are gone within seconds.
        */}
        <div ref={openingRef} className="glass-opening" aria-hidden="true">
          {glass.opening.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <Container>
          <header className="glass-header glass-enter" role="banner">
            <SiteBrand />
            <nav className="desk-nav" aria-label="Primary">
              <a href="/contact" className="desk-nav-link">
                {glass.nav.contact}
              </a>
            </nav>
          </header>
        </Container>

        <section className="glass-hero" aria-labelledby="glass-title">
          <Container className="glass-hero-inner">
            <p className="glass-kicker glass-enter">{glass.hero.kicker}</p>
            <h1 id="glass-title" className="glass-title glass-enter">
              <span>{glass.hero.headlineStart}</span>{' '}
              <span>{glass.hero.headlineEnd}</span>
            </h1>
            <p className="glass-lede glass-enter">{glass.hero.lede}</p>
            <div id="early-access" className="glass-form glass-enter">
              <WaitlistForm inline />
            </div>
            <p className="glass-note glass-enter">{glass.hero.assurance}</p>
            <a href="#film" className="glass-watch glass-enter">
              {glass.hero.watch}
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="glass-watch-arrow"
              >
                <path
                  d="M8 3v10M4 9l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Container>
        </section>

        <div className="glass-film-enter glass-enter">
          <GlassFilm ready={opening !== 'playing'} />
        </div>
      </div>

      <GlassSources />
      <Rules />
      <Morning />
      <Close />
    </div>
  )
}

/** A title in two tones: the statement in ink, the turn in the quiet ink. */
function TwoTone({ id, start, end }: { id: string; start: string; end: string }) {
  return (
    <h2 id={id} className="glass-heading glass-two-tone">
      <span>{start}</span> <span>{end}</span>
    </h2>
  )
}

/**
 * The night as it is meant to run, drawn as a flowchart on paper.
 *
 * A diagram and not an interface: no toggle, no field, no cursor, nothing that
 * could be mistaken for a screen of a product that has not shipped. The states
 * at the end of each branch are the matrix's chips, so the held state carries
 * the signal here exactly as it does on the sheet.
 */
function Rules() {
  const { rules } = glass
  return (
    <section className="glass-rules" aria-labelledby="rules-title">
      <Container>
        <Reveal className="glass-section-head">
          <TwoTone id="rules-title" start={rules.headline} end={rules.headlineTail} />
          <p className="glass-section-lede">{rules.lede}</p>
        </Reveal>

        <Reveal delay={80}>
          <figure data-lit="" className="glass-flow">
            <figcaption className="glass-flow-caption">{rules.caption}</figcaption>
            <p className="glass-flow-trigger">
              <span className="glass-flow-node" aria-hidden="true" />
              {rules.trigger}
            </p>
            <ol className="glass-flow-steps">
              {rules.steps.map((step, index) => (
                <li
                  key={step.when}
                  className="glass-flow-step"
                  style={{ ['--i' as string]: index }}
                >
                  <span className="glass-flow-node" aria-hidden="true" />
                  <span className="glass-flow-when">{step.when}</span>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="glass-flow-arrow"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="glass-flow-then">{step.then}</span>
                  <span className={`matrix-status matrix-status--${step.status}`}>
                    {glass.film.statusLabels[step.status]}
                  </span>
                </li>
              ))}
            </ol>
            <p className="glass-flow-never">{rules.never}</p>
          </figure>
        </Reveal>
      </Container>
    </section>
  )
}

/**
 * The same night, from the hour the office empties to the decision at 08:04,
 * with every hour on a shared scale — which is the argument drawn: most of it
 * happens while nobody is there. Marks sit at their real minute; on a narrow
 * screen, where 23:47 and 00:06 would land on top of each other, the scale
 * becomes a list down a single rule.
 */
function Morning() {
  const { morning } = glass
  const { matrix } = home
  const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
  const value = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
  const short = ledger.find((entry) => entry.breaches)
  const at = (time: string) => minutesAfter(morning.leave.at, time) / nightLength

  return (
    <section className="glass-morning" aria-labelledby="morning-title">
      <Container>
        <Reveal className="glass-section-head">
          <Label>{morning.label}</Label>
          <TwoTone
            id="morning-title"
            start={morning.headline}
            end={morning.headlineTail}
          />
          <p className="glass-section-lede">{lastBeat?.title}</p>
        </Reveal>

        <Reveal delay={80}>
          <figure data-lit="" className="glass-day">
            <figcaption className="glass-day-caption">{morning.caption}</figcaption>

            <div className="glass-day-scale">
              <div className="glass-day-ticks" aria-hidden="true">
                {Array.from({ length: nightHours }, (_, hour) => (
                  <span
                    key={hour}
                    style={{ ['--at' as string]: (hour * 60) / nightLength }}
                  />
                ))}
              </div>
              <ol className="glass-day-marks">
                <li
                  className="glass-day-mark"
                  data-person="true"
                  data-side="above"
                  style={{ ['--at' as string]: 0 }}
                >
                  <span className="glass-day-time ic-tabular">{morning.leave.at}</span>
                  <span className="glass-day-text">{morning.leave.text}</span>
                </li>
                {morning.marks.map((mark, index) => {
                  const position = at(mark.at)
                  return (
                    <li
                      key={mark.at}
                      className="glass-day-mark"
                      data-person={index === morning.marks.length - 1 ? 'true' : 'false'}
                      data-side={index % 2 === 0 ? 'below' : 'above'}
                      data-align={position > 0.8 ? 'end' : 'start'}
                      style={{ ['--at' as string]: position }}
                    >
                      <span className="glass-day-time ic-tabular">{mark.at}</span>
                      <span className="glass-day-text">{mark.text}</span>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="glass-day-waiting">
              <p className="glass-day-waiting-label">{morning.waiting}</p>
              <dl className="glass-day-summary">
                <div>
                  <dt>{matrix.summary.priced}</dt>
                  <dd>
                    {matrix.lines.priced}
                    <span> / {matrix.lines.total}</span>
                  </dd>
                </div>
                <div>
                  <dt>{matrix.summary.held}</dt>
                  <dd className="glass-day-held">{matrix.lines.held}</dd>
                </div>
                <div>
                  <dt>{matrix.summary.margin}</dt>
                  <dd>
                    {value('Expected margin')}
                    <span>
                      {' '}
                      · {matrix.summary.floor} {value('Commercial floor')}
                    </span>
                  </dd>
                </div>
                {short ? (
                  <div className="glass-day-short">
                    <dt>{short.term}</dt>
                    <dd>{short.value}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="glass-day-call">{morning.call}</p>
            </div>
          </figure>
        </Reveal>
      </Container>
    </section>
  )
}

/**
 * Where the build stands, and one invitation — the home page's close, on the
 * same desk the contact memo is laid on.
 *
 * The motto is not here: its placements are the home page's last line and the
 * success state, and this page already carries the second through its form.
 */
function Close() {
  const { closing } = glass
  return (
    <div className="desk glass-desk">
      <section className="glass-close" aria-labelledby="glass-close-title">
        <Container>
          <Reveal className="glass-standing-wrap">
            <Label>{glass.standing.label}</Label>
            <ol className="glass-standing">
              {glass.standing.stages.map((stage) => (
                <li key={stage.state}>
                  <span className="glass-standing-state">{stage.state}</span>
                  <span className="glass-standing-title">{stage.title}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="glass-close-grid">
            <div className="flex flex-col gap-5">
              <Label>{closing.label}</Label>
              <h2 id="glass-close-title" className="glass-heading max-w-[18ch]">
                {closing.headline}
              </h2>
              <p className="glass-section-lede">{closing.body}</p>
            </div>

            <div className="glass-close-actions">
              <ButtonLink href="/contact" arrow className="desk-cta">
                {closing.action}
              </ButtonLink>
              <div className="flex flex-col gap-2">
                <Label>{closing.emailLabel}</Label>
                <TextLink
                  href={`mailto:${contactEmail}`}
                  className="w-fit font-display text-heading text-ink"
                >
                  {contactEmail}
                </TextLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <footer className="glass-footer" role="contentinfo">
        <Container className="glass-footer-inner">
          <SiteBrand />
          <p className="text-small text-ink-600">
            © {new Date().getFullYear()} {brand.name}
          </p>
          <p className="text-small text-ink-600">{glass.status}</p>
        </Container>
      </footer>
    </div>
  )
}
