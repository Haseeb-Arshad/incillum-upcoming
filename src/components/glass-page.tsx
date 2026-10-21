import { useEffect, useRef, useState } from 'react'

import { GlassField } from '#/components/glass-field.tsx'
import { GlassFilm } from '#/components/glass-film.tsx'
import { GlassHandover } from '#/components/glass-handover.tsx'
import { GlassSources } from '#/components/glass-sources.tsx'
import { CharlieAct } from '#/components/charlie.tsx'
import { HowItWorks } from '#/components/how-it-works.tsx'
import { MastheadBar } from '#/components/masthead-bar.tsx'
import { ButtonLink, Container, TextLink } from '#/components/primitives.tsx'
import { Questions } from '#/components/questions.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { Standing } from '#/components/standing.tsx'
import { StepIcon } from '#/components/step-icon.tsx'
import { Trust } from '#/components/trust.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import {
  brand,
  contact,
  glass,
  how,
  instrument,
  questions,
  thread,
  trust,
} from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

/**
 * /glass — the presentation.
 *
 * ── The acts ───────────────────────────────────────────────────────────────
 *
 * 1. **The opening.** The night, a field of hour rules drawing down it, a
 *    landscape of dust under it (`glass-field.tsx`), and two beats of type.
 *    Then the page assembles: the dust sinks, dims and clears a space for the
 *    type, and falls behind as the page scrolls.
 * 2. **The hero.** Centred: the headline and the home page's form.
 * 3. **The film.** One request carried from 23:47 to 08:04 in a frame, the
 *    sheet changing state as the hours pass (`glass-film.tsx`).
 * 4. **Six sources.** The documents a quotation is assembled from, lying on a
 *    desk, then gathered onto one sheet (`glass-sources.tsx`).
 * 5. **How it works.** Four tabs — read, hold, price, decide — each one line of
 *    the quotation laid on the desk under the lamp, each ending where the work
 *    stops (`how-it-works.tsx`).
 * 6. **Where this stands, data and trust, questions.** What is built; six
 *    commitments with their real state, where the reference pages put their
 *    certification badges; and what a buyer asks, answered in full
 *    (`standing.tsx`, `trust.tsx`, `questions.tsx`).
 * 7. **The close.** The same office at 08:04 with what is waiting in it
 *    (`glass-handover.tsx`), the night's dust settled around it, one
 *    invitation, and one sentence about what exists.
 *
 * Acts one to three are the page's one `[data-inverted]` region. The film ends
 * at 08:04 and the page turns to paper with it.
 *
 * ── What it leaves out ─────────────────────────────────────────────────────
 *
 * There were two more acts — the night's rules as a flowchart, and the night as
 * a timeline — and a label over every heading. They were the parts that read as
 * assembled rather than made: each one said again, in a new frame, what the
 * film had already shown. The film and the desk are the presentation; what is
 * left after them is the ask.
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

const officeEmpties = `${instrument.officeHours.to}:00`
const morning = thread.beats[thread.beats.length - 1]?.at ?? officeEmpties
/** One rule per whole hour of the night, from the hour the office empties to the morning. */
const nightHours = Math.floor(minutesAfter(officeEmpties, morning) / 60) + 1

export function GlassPage() {
  const openingRef = useRef<HTMLDivElement>(null)
  const filmRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [opening, setOpening] = useState<Opening>('playing')
  const [scrolled, setScrolled] = useState(false)

  /**
   * Whether the first screen has scrolled away, as one boolean from an
   * observer rather than a scroll listener — two renders a visit. It is what
   * fills the masthead in.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

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
      <span ref={sentinelRef} className="glass-sentinel" aria-hidden="true" />
      <div data-inverted="" className="glass-night">
        <div className="glass-hours" aria-hidden="true">
          {Array.from({ length: nightHours }, (_, hour) => (
            <span key={hour} style={{ ['--i' as string]: hour }} />
          ))}
        </div>

        <GlassField settled={opening !== 'playing'} until={filmRef} />

        {/*
          Decoration, as far as a screen reader is concerned: the two beats set
          a scene the hero then states, and they are gone within seconds.
        */}
        <div ref={openingRef} className="glass-opening" aria-hidden="true">
          {glass.opening.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {/*
          The masthead stays with the reader: fixed, transparent over the night,
          and filled with the night's own ground once the first screen has gone.
          It belongs to the night region, so it is the same night bar over every
          act on the desk and never changes colour twice a visit.
        */}
        <MastheadBar scrolled={scrolled} onFront className="glass-enter" />

        <section className="glass-hero" aria-labelledby="glass-title">
          <Container className="glass-hero-inner">
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

        <div ref={filmRef} className="glass-film-enter glass-enter">
          <GlassFilm ready={opening !== 'playing'} />
        </div>
      </div>

      <GlassSources />
      <div className="desk glass-acts">
        <HowItWorks />
        <CharlieAct />
        <Standing />
        <Trust more />
        <Questions />
      </div>
      <Close />
    </div>
  )
}

/**
 * The morning, and one invitation, on the same desk the contact memo is laid on.
 *
 * The page ends where the film does: the same office, at 08:04 — the night
 * plate's own room in daylight, the lamp still on over the quotation. It is
 * the one large picture on the page and it sits above the ask, so the last
 * thing a reader sees before deciding is the morning the product is for.
 *
 * Left-aligned, one statement, one action and an address — no label over it —
 * and under them what happens after somebody writes: the contact memo's own
 * three steps, read from `contact`, so the two pages promise the same thing in
 * the same words. Where the build stands is a sentence read off `standing`, set
 * as quietly as the footer it sits above.
 *
 * The motto signs the page off at the head of the footer. This is the front
 * page, and its close is one of the motto's two placements; the other is the
 * success state of the form above.
 */
function Close() {
  const { closing } = glass
  return (
    <div className="desk glass-desk">
      <section className="glass-close" aria-labelledby="glass-close-title">
        <Container>
          <MorningPlate />
          <Reveal className="glass-close-grid">
            <h2 id="glass-close-title" className="glass-close-title">
              {closing.headline}
            </h2>
            <div className="glass-close-side">
              <p className="glass-close-body">{closing.body}</p>
              <div className="glass-close-actions">
                <ButtonLink href="/contact" arrow className="desk-cta">
                  {closing.action}
                </ButtonLink>
                <p className="glass-close-write">
                  {closing.writeTo}{' '}
                  <TextLink href={`mailto:${contactEmail}`} className="text-ink">
                    {contactEmail}
                  </TextLink>
                </p>
              </div>
              <div className="glass-next">
                <p className="glass-next-label">{closing.nextLabel}</p>
                <ol className="glass-next-steps">
                  {contact.steps.map((step) => (
                    <li key={step.icon}>
                      <StepIcon name={step.icon} />
                      <span>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <footer className="glass-footer" role="contentinfo">
        <Container>
          {/*
            The motto: one of its two placements on the whole site, and the
            page's sign-off. It is not extended and not repeated — see
            `brand.motto`.
          */}
          <p className="glass-motto">{brand.motto}</p>
          <nav aria-label="Sections" className="glass-footer-nav">
            <a href={`#${how.anchor}`}>{glass.nav.how}</a>
            <a href={`#${trust.anchor}`}>{glass.nav.trust}</a>
            <a href={`#${questions.anchor}`}>{glass.nav.questions}</a>
            <a href="/contact">{glass.nav.contact}</a>
          </nav>
          <div className="glass-footer-inner">
            <SiteBrand />
            <p className="glass-standing">{glass.standing}</p>
            <p className="glass-copyright">
              © {new Date().getFullYear()} {brand.name}
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

/**
 * The morning plate: the photograph, what is waiting in it, and the dust.
 *
 * The photograph is cropped a little larger than its frame and drifts against
 * the scroll by a few per cent, so the room reads as a place seen through the
 * page rather than a print laid on it. The drift is a custom property written
 * on an animation frame — nothing re-renders — and under reduced motion it is
 * never written at all: the frame holds still, centred.
 *
 * Its caption is the handover, laid over the window on a wide screen and
 * tucked under the photograph on a narrow one; behind it, the night's dust has
 * settled on the desk.
 */
function MorningPlate() {
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let request = 0

    function place() {
      request = 0
      if (!frame) return
      if (motion.matches) {
        frame.style.removeProperty('--glass-drift')
        return
      }
      const box = frame.getBoundingClientRect()
      const through = (window.innerHeight - box.top) / (window.innerHeight + box.height)
      frame.style.setProperty(
        '--glass-drift',
        (Math.min(1, Math.max(0, through)) - 0.5).toFixed(3),
      )
    }
    function onScroll() {
      if (!request) request = requestAnimationFrame(place)
    }

    place()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    motion.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(request)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      motion.removeEventListener('change', onScroll)
    }
  }, [])

  const widths = [640, 900, 1280, 1896]
  const sizes = '(min-width: 1360px) 1280px, 100vw'
  return (
    <figure className="glass-morning">
      <GlassField tone="morning" />
      <div ref={frameRef} className="glass-morning-frame">
        <picture>
          <source
            type="image/avif"
            sizes={sizes}
            srcSet={widths
              .map((width) => `/glass/morning-${width}.avif ${width}w`)
              .join(', ')}
          />
          <source
            type="image/webp"
            sizes={sizes}
            srcSet={widths
              .map((width) => `/glass/morning-${width}.webp ${width}w`)
              .join(', ')}
          />
          <img
            src="/glass/morning-1896.jpg"
            alt={glass.closing.morning}
            width={1896}
            height={830}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </picture>
      </div>
      <GlassHandover />
    </figure>
  )
}
