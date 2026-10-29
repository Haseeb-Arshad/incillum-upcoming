import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import type { ReactNode } from 'react'

import { BackToTop, FooterWordmark } from '#/components/footer-wordmark.tsx'
import { GlassField } from '#/components/glass-field.tsx'
import { GlassHandover } from '#/components/glass-handover.tsx'
import { Case } from '#/components/case.tsx'
import { GlassReel } from '#/components/glass-reel.tsx'
import { MastheadBar } from '#/components/masthead-bar.tsx'
import { ButtonLink, Container, TextLink } from '#/components/primitives.tsx'
import { Questions } from '#/components/questions.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { Showcase } from '#/components/showcase.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { StepIcon } from '#/components/step-icon.tsx'
import { Trust } from '#/components/trust.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import {
  brand,
  contact,
  glass,
  instrument,
  questions,
  thread,
  trust,
} from '#/content/site.ts'
import { contactEmail } from '#/env.ts'
import { liveAttribute } from '#/lib/masthead.ts'
import { markOpeningSeen, openingSeen, rememberPlace } from '#/lib/opening.ts'

/**
 * /glass — the presentation.
 *
 * ── The acts ───────────────────────────────────────────────────────────────
 *
 * 1. **The opening.** The night, a field of hour rules drawing down it, and
 *    three short beats introducing intelligence, the work, and Charlie, set a
 *    word at a time, on plain night. As the last leaves and the page
 *    assembles, a landscape of dust comes up out of the dark behind the
 *    headline (`glass-field.tsx`) — only its light changes — rises a little
 *    into place, clears a space for the type, and falls behind as the page
 *    scrolls.
 * 2. **The hero.** Centred: the headline and the home page's form.
 * 3. **The film.** What Incillum does with a request, in forty-nine seconds:
 *    one statement a beat over Studio's own screens and three daylight plates
 *    (`glass-reel.tsx`, rendered from `video/product-film`). It replaced the
 *    night played hour by hour in a frame (`glass-film.tsx`), which is kept,
 *    unplaced, with its styles, so it can be put back by one line.
 * 4. **The case.** Two short sections in figures: what a slow reply costs and
 *    how a sales rep's week is spent, with a map in dots, one bar and every
 *    source named beside the figures (`case.tsx`). These are third-party
 *    findings, not Incillum's results.
 * 5. **Data and trust, questions.** Six commitments about a business's
 *    figures, followed by what a buyer asks, answered in full (`trust.tsx`,
 *    `questions.tsx`).
 * 6. **The close.** The same office at 08:04 with what is waiting in it
 *    (`glass-handover.tsx`), the night's dust settled around it, and one
 *    invitation.
 *
 * The night and the film are the page's one `[data-inverted]` region. The case,
 * trust, questions and close sit on paper after it.
 *
 * Charlie's six beats (`charlie.tsx`), the six sources gathering
 * (`glass-sources.tsx`) and the four tabs (`how-it-works.tsx`) stood between
 * the film and the trust cards until 29 October 2026, when the owner found
 * that each told the film's steps again. They are kept, unplaced, with their
 * styles.
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
 *
 * It plays once a visit (`lib/opening.ts`): the first time the page is opened
 * in a tab, and again on a reload. Back from another page of the site, the page
 * is simply there — `seen`, drawn assembled by the stylesheet before hydration
 * and kept so by the state after it.
 */

type Opening = 'playing' | 'skipped' | 'ended' | 'seen'

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

/** Whether the opening has been seen does not change under a mounted page, so there is nothing to subscribe to. */
const stay = () => () => {}

export function GlassPage() {
  const openingRef = useRef<HTMLDivElement>(null)
  const filmRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const duskRef = useRef<HTMLSpanElement>(null)
  const [played, setOpening] = useState<Exclude<Opening, 'seen'>>('playing')
  const [scrolled, setScrolled] = useState(false)
  const [overNight, setOverNight] = useState(true)
  /**
   * A return this visit. False on the server and while hydrating, so the markup
   * matches; then read from the document, which the head script has already
   * marked — or from this page's own memory, after a client-side return.
   */
  const returned = useSyncExternalStore(stay, openingSeen, () => false)
  const opening: Opening = returned && played === 'playing' ? 'seen' : played

  /**
   * Whether the opening could play, read once as the page mounts: a preference
   * changed later does not turn an opening that never played into one seen.
   */
  const stillRef = useRef(true)
  useEffect(() => {
    stillRef.current = matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Played to its end or ended early, it has been seen. Under reduced motion it never played.
  useEffect(() => {
    if (played !== 'ended' && played !== 'skipped') return
    if (!stillRef.current) markOpeningSeen()
  }, [played])

  /**
   * Where the reader already is, read from the page itself as it mounts. The
   * server can only draw the top of the page, and the observers below report a
   * frame or more later; a reader put back halfway down by their browser
   * would see the masthead in the wrong colours for that long. Before the
   * script ran, the head script (`lib/masthead.ts`) held the same two answers
   * in the stylesheet; this is the hand-over, and it lands before paint: the
   * mark that ends the head script's say is set in the same breath as the state
   * that replaces it.
   */
  useLayoutEffect(() => {
    const sentinel = sentinelRef.current
    const dusk = duskRef.current
    if (sentinel) setScrolled(sentinel.getBoundingClientRect().bottom < 0)
    if (dusk) setOverNight(dusk.getBoundingClientRect().top >= 0)
    document.documentElement.setAttribute(liveAttribute, '')
  }, [])

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

  /**
   * Whether the night is still under the masthead: a point half a masthead
   * above the night's end, against a root that runs from the top of the screen
   * to far below it — so the point is inside it exactly while it has not
   * scrolled past the top, and every crossing flips it, however fast.
   */
  useEffect(() => {
    const dusk = duskRef.current
    if (!dusk || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setOverNight(entry.boundingClientRect.top >= 0)
      },
      { rootMargin: '0px 0px 100000px 0px' },
    )
    observer.observe(dusk)
    return () => observer.disconnect()
  }, [])

  // Where the reader was when they left, so a reload below the first screen does not replay the opening over the page.
  useEffect(() => {
    window.addEventListener('pagehide', rememberPlace)
    return () => window.removeEventListener('pagehide', rememberPlace)
  }, [])

  /**
   * Any input ends the opening early — and so does a scroll, which is how a
   * restored position the head script could not foresee shows itself.
   */
  useEffect(() => {
    if (opening !== 'playing') return
    const skip = () => setOpening('skipped')
    const inputs = ['keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll'] as const
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
    <div
      className="glass"
      data-opening={opening}
      style={{ ['--glass-beats' as string]: glass.opening.length }}
    >
      <span ref={sentinelRef} className="glass-sentinel" aria-hidden="true" />

      {/*
        The masthead stays with the reader: fixed, clear over the first screen
        and a pane of glass after it, in the tokens of whatever it is over. It
        sits outside every section, so none of them can paint over it.
      */}
      <MastheadBar
        scrolled={scrolled}
        onFront
        tone={overNight ? 'night' : 'day'}
        className="glass-enter"
      />

      <div data-inverted="" className="glass-night">
        <div className="glass-hours" aria-hidden="true">
          {Array.from({ length: nightHours }, (_, hour) => (
            <span key={hour} style={{ ['--i' as string]: hour }} />
          ))}
        </div>

        <GlassField
          opening={openingRef}
          skipped={opening === 'skipped'}
          until={filmRef}
        />

        {/*
          Decoration, as far as a screen reader is concerned: the beats set a
          scene the hero then states, and they are gone within seconds. Each
          word is its own mask with the word inside it, so the line can be set
          a word at a time.
        */}
        <div ref={openingRef} className="glass-opening" aria-hidden="true">
          {glass.opening.map((line, index) => (
            <p key={line} style={{ ['--beat' as string]: index }}>
              {line.split(' ').map((word, at) => (
                <Fragment key={at}>
                  {at > 0 && ' '}
                  <span style={{ ['--word' as string]: at }}>
                    <span>{word}</span>
                  </span>
                </Fragment>
              ))}
            </p>
          ))}
        </div>

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
          <GlassReel />
        </div>
        <span ref={duskRef} className="glass-dusk" aria-hidden="true" />
      </div>

      {/*
        The film shows the work step by step, so nothing after it walks the
        steps again: the case for it, in figures with their sources, what
        Incillum does with a business's figures, and the questions.
      */}
      <div className="desk glass-acts">
        <Case />
        <Showcase />
        <Trust />
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
 * the same words.
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
          <MorningStack>
            <MorningPlate />
            <GlassHandover />
          </MorningStack>
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
            <a href="#odds">{glass.nav.how}</a>
            <a href={`#${trust.anchor}`}>{glass.nav.trust}</a>
            <a href={`#${questions.anchor}`}>{glass.nav.questions}</a>
            <a href="/contact">{glass.nav.contact}</a>
            <BackToTop />
          </nav>
          <div className="glass-footer-inner">
            <SiteBrand />
            <p className="glass-copyright">
              © {new Date().getFullYear()} {brand.name}
            </p>
          </div>
        </Container>
        <FooterWordmark />
      </footer>
    </div>
  )
}

/**
 * The morning, as a stack of cards: the photograph, and what is waiting
 * under it, drawn as one deck that is dealt as the reader comes to it.
 *
 * Three custom properties are written on the stack, each a fraction from 0 to
 * 1 or, for the drift, -0.5 to 0.5, from where the pieces are on the screen. They
 * are written on an animation frame and nothing re-renders:
 *
 * - `--glass-drift`: how far through the screen the photograph is. The
 *   photograph is cropped a little larger than its frame and moves against the
 *   scroll by a few per cent, so the room reads as a place seen through the
 *   page rather than a print laid on it.
 * - `--glass-rise`: the photograph coming up and settling (it grows from a
 *   little smaller and comes up a little) while the two sheets behind it step
 *   out above it, one behind the other, like a deck being fanned.
 * - `--glass-deal`: the two cards of the handover, which come out from under
 *   the photograph into their places, one a little after the other.
 *
 * Each has its resting value in the stylesheet, which is the last frame: so the
 * server, a page without a script and a reader who asked for less motion all
 * get the deck as it ends up, and under reduced motion nothing is written.
 */
function MorningStack({ children }: { children: ReactNode }) {
  const stackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const names = ['--glass-drift', '--glass-rise', '--glass-deal']
    const clamp = (value: number) => Math.min(1, Math.max(0, value))
    let request = 0

    function place() {
      request = 0
      if (!stack) return
      if (motion.matches) {
        for (const name of names) stack.style.removeProperty(name)
        return
      }
      const height = window.innerHeight
      const frame = stack.querySelector('.glass-morning-frame')?.getBoundingClientRect()
      const cards = stack.querySelector('.glass-handover')?.getBoundingClientRect()
      if (frame) {
        stack.style.setProperty(
          '--glass-drift',
          (clamp((height - frame.top) / (height + frame.height)) - 0.5).toFixed(3),
        )
        stack.style.setProperty('--glass-rise', clamp((height - frame.top) / (height * 0.5)).toFixed(3))
      }
      if (cards) {
        stack.style.setProperty('--glass-deal', clamp((height - cards.top) / (height * 0.5)).toFixed(3))
      }
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

  return (
    <div ref={stackRef} className="glass-stack">
      {children}
    </div>
  )
}

/**
 * The morning plate: the photograph, on a deck of two sheets, with the dust.
 *
 * The photograph is left clean: nothing is laid over it, by the owner's call
 * of 29 October 2026. What is waiting in the room is the handover under it
 * (`glass-handover.tsx`); round the photograph, the night's dust has settled
 * on the desk. Behind it are two blank sheets, each a step higher and a step
 * narrower than the one in front, which is the stair the owner asked for: the
 * photograph is the top card of a stack, and the cards under it are the same
 * kind of thing.
 */
function MorningPlate() {
  const widths = [640, 900, 1280, 1896]
  const sizes = '(min-width: 1360px) 1280px, 100vw'
  return (
    <figure className="glass-morning">
      <GlassField tone="morning" />
      <div className="glass-deck">
        <span className="glass-stair glass-stair--near" aria-hidden="true" />
        <span className="glass-stair glass-stair--far" aria-hidden="true" />
        <div className="glass-morning-frame">
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
      </div>
    </figure>
  )
}
