import { useEffect, useRef, useState } from 'react'

import { StepIcon } from '#/components/step-icon.tsx'
import { GlassFilm } from '#/components/glass-film.tsx'
import { GlassHandover } from '#/components/glass-handover.tsx'
import { GlassSources } from '#/components/glass-sources.tsx'
import { HowItWorks } from '#/components/how-it-works.tsx'
import { ButtonLink, Container, Label, TextLink } from '#/components/primitives.tsx'
import { Questions } from '#/components/questions.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { Standing } from '#/components/standing.tsx'
import { Trust } from '#/components/trust.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, contact, glass, home, how, nightfall, questions, trust } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

import type { MouseEvent } from 'react'

/**
 * The home page: one quotation, told in eight acts.
 *
 * ── The acts ───────────────────────────────────────────────────────────────
 *
 * 1. **The plate.** The commissioned photograph, full-bleed, as the first
 *    screen: an empty office, one lamp, a quotation still lying under it.
 * 2. **The film.** The night itself, played in a frame — one sheet that fills
 *    from 23:47 to 08:04 (`glass-film.tsx`, shared with /glass).
 * 3. **Six sources.** The documents the quotation is assembled from, scattered
 *    on a desk, then gathered onto one sheet (`glass-sources.tsx`).
 * 4. **How it works.** Four tabs — read, hold, price, decide — each one line of
 *    the quotation close up, each ending where it stops.
 * 5. **Where this stands.** Built, in build, opening.
 * 6. **Data and trust.** Six commitments, each with its real state.
 * 7. **Questions.** Answered in full, nothing folded away.
 * 8. **The morning.** The same office at 08:04, what is waiting in it, one
 *    invitation, and the motto.
 *
 * Acts one and two are the page's single `[data-inverted]` region; the film
 * ends at 08:04 and the page turns to paper with it. Nothing inside the night
 * knows it is dark; the film's sheet re-points the tokens back to paper with
 * `[data-lit]`, the way the band re-points them to night.
 *
 * ── What it cannot borrow from the pages it is measured against ────────────
 *
 * Enterprise pages at this level lean on a wall of proof — customer logos,
 * volume figures, testimonials, certification badges. This site has none of
 * them and may not imply any (AGENTS.md §5). Each act carries the honest
 * substitute instead, and every figure on the page is one invented quotation's,
 * read by the components from one content file so no two acts can disagree.
 *
 * ── The masthead ───────────────────────────────────────────────────────────
 *
 * One `banner`, fixed, so the way to act and the way round the page stay with
 * the reader down a long page. Over the photograph it is transparent; once the
 * first screen has scrolled away it fills in with the night — the one state
 * change it has. It belongs to the night region, so it is the same night bar
 * over every section and never changes colour twice a visit.
 *
 * Motion, all of it off under `prefers-reduced-motion`: the headline lines rise
 * out of their own boxes and the copy follows. The photograph does not move.
 */
export function HomePage() {
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return
    // A boolean from an observer, not a scroll listener: two renders a visit.
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="home">
      <span ref={sentinelRef} className="home-sentinel" aria-hidden="true" />

      <div data-inverted="" className="home-night">
        <header className="home-bar home-drop" role="banner" data-scrolled={scrolled ? 'true' : 'false'}>
          <Container className="home-bar-inner">
            <SiteBrand />
            <nav className="desk-nav" aria-label="Primary">
              <a href={`#${how.anchor}`} className="desk-nav-link">
                {home.nav.how}
              </a>
              <a href={`#${trust.anchor}`} className="desk-nav-link">
                {home.nav.trust}
              </a>
              <a href={`#${questions.anchor}`} className="desk-nav-link">
                {home.nav.questions}
              </a>
              <a href="/contact" className="desk-nav-link">
                {home.nav.contact}
              </a>
              <ButtonLink href="#early-access" arrow className="desk-cta" onClick={focusEmail}>
                {home.cta}
              </ButtonLink>
            </nav>
          </Container>
        </header>

        <section className="hero" aria-labelledby="home-title">
          <HeroPlate />

          <Container className="hero-inner">
            <div className="hero-body">
              <div className="hero-copy">
                <p className="hero-kicker home-rise">{home.kicker}</p>
                <h1 id="home-title" className="home-title">
                  <span className="home-line">
                    <span>{home.headlineStart}</span>
                  </span>{' '}
                  <span className="home-line">
                    <span>{home.headlineEnd}</span>
                  </span>
                </h1>
                <p className="home-lede home-rise">{home.lede}</p>
                <div id="early-access" className="home-form home-rise">
                  <WaitlistForm inline />
                </div>
                <p className="home-note home-rise">{home.assurance}</p>
                <a href="#film" className="glass-watch home-watch home-rise">
                  {home.watch}
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="glass-watch-arrow">
                    <path
                      d="M8 3v10M4 9l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>

              {/*
                The picture's title, set in the frame it names. Real text, so it
                is read aloud after the headline rather than lost in an `alt`.
              */}
              <p className="hero-caption home-rise">{nightfall.caption}</p>
            </div>
          </Container>
        </section>

        <div className="home-film">
          <GlassFilm ready />
        </div>
      </div>

      <GlassSources />

      <div className="desk home-desk">
        <HowItWorks />
        <Standing />
        <Trust />
        <Questions />
        <Morning />

        <footer className="home-footer" role="contentinfo">
          <Container>
            <Reveal className="home-footer-sign">
              <SiteBrand />
              {/*
                The motto: one of its two placements on the whole site, and the
                last thing on the page. It is not extended and not repeated —
                see `brand.motto`.
              */}
              <p className="font-display text-title text-ink">{brand.motto}</p>
            </Reveal>
            <div className="home-footer-base">
              <nav aria-label="Sections" className="home-footer-nav">
                <a href={`#${how.anchor}`}>{home.nav.how}</a>
                <a href={`#${trust.anchor}`}>{home.nav.trust}</a>
                <a href={`#${questions.anchor}`}>{home.nav.questions}</a>
                <a href="/contact">{home.nav.contact}</a>
              </nav>
              <p className="text-small text-ink-600">{home.status}</p>
              <p className="text-small text-ink-600">
                © {new Date().getFullYear()} {brand.name}
              </p>
            </div>
          </Container>
        </footer>
      </div>
    </div>
  )
}

/**
 * The photograph, full-bleed behind the first screen.
 *
 * `sizes` at the full viewport because here the plate is. `fetchPriority="high"`
 * and no lazy loading: it is the largest thing in the first screen. The `alt` is
 * the composition, from `nightfall.alt`; the caption is a separate line of text.
 *
 * The scrim is the one gradient on the site, and it is functional rather than
 * decorative: it is what holds the headline at AA over a photograph, on the
 * side of the frame where the monitor is switched off and nothing is lit.
 */
function HeroPlate() {
  const sizes = '100vw'
  const widths = [640, 900, 1280, 1672]
  return (
    <div className="hero-plate">
      <picture>
        <source
          type="image/avif"
          sizes={sizes}
          srcSet={widths.map((w) => `/night/night-${w}.avif ${w}w`).join(', ')}
        />
        <source
          type="image/webp"
          sizes={sizes}
          srcSet={widths.map((w) => `/night/night-${w}.webp ${w}w`).join(', ')}
        />
        <img
          src="/night/night-1672.jpg"
          alt={nightfall.alt}
          width={1672}
          height={941}
          decoding="async"
          fetchPriority="high"
          draggable="false"
        />
      </picture>
    </div>
  )
}

/**
 * The morning: the night plate's own room at 08:04, what is waiting in it, and
 * one invitation.
 *
 * The page ends where the film does. The photograph is the morning plate /glass
 * closes on, here held still — this page's photographs do not move — with the
 * handover laid over the window: the decision and the two figures it turns on,
 * read from the film's last frame and the 06:50 ledger.
 *
 * Under it, the ask, the address, and what happens after somebody writes —
 * the contact memo's own three steps, read from `contact` so the two pages
 * promise the same thing in the same words.
 */
function Morning() {
  const widths = [640, 900, 1280, 1896]
  const sizes = '(min-width: 1360px) 1280px, 100vw'
  const { closing } = home
  return (
    <section aria-labelledby="closing-title" className="home-closing">
      <Container>
        <figure className="glass-morning home-morning">
          <div className="glass-morning-frame">
            <picture>
              <source
                type="image/avif"
                sizes={sizes}
                srcSet={widths.map((width) => `/glass/morning-${width}.avif ${width}w`).join(', ')}
              />
              <source
                type="image/webp"
                sizes={sizes}
                srcSet={widths.map((width) => `/glass/morning-${width}.webp ${width}w`).join(', ')}
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

        <Reveal className="home-closing-grid">
          <div className="home-closing-copy">
            <Label>{closing.label}</Label>
            <h2 id="closing-title" className="home-closing-title">
              {closing.headline}
            </h2>
            <p className="home-closing-body">{closing.body}</p>
          </div>

          <div className="home-closing-side">
            <ButtonLink href="/contact" arrow className="desk-cta desk-cta--large">
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
            <div className="home-next">
              <Label>{closing.nextLabel}</Label>
              <ol className="home-next-steps">
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
  )
}

/**
 * The masthead's call to action lands on the field rather than near it.
 *
 * On a wide screen the form is already in view, so a plain jump to
 * `#early-access` would do nothing visible and read as a dead button. Focusing
 * the field scrolls it into view where it is not and puts the cursor in it
 * where it is. Without JavaScript the anchor still jumps.
 */
function focusEmail(event: MouseEvent<HTMLAnchorElement>) {
  const field = document.querySelector<HTMLInputElement>('#early-access input[type="email"]')
  if (!field) return
  event.preventDefault()
  field.focus()
}
