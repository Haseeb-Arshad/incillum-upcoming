import { ButtonLink } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, home } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

import type { MouseEvent } from 'react'

/**
 * The harbour edition — the public home page.
 *
 * One screen: the headline and the address field on the paper, and the
 * engraved harbour with its orbit of commercial documents to the right of it.
 * Below the fold, one short section for the masthead's "Approach" link to land
 * on, and a footer.
 *
 * The picture is a single raster (`public/harbour.webp`, encoded from
 * `public/new.png`), shown as it was drawn — no fades on its sides. It sits on
 * a plate with the raster's own aspect ratio that always covers the first
 * screen, anchored right, so the orbit never drifts under the headline. The
 * caption lives on the plate too, in the picture's own coordinates, so it
 * stays beside the cards at every size instead of drifting onto one. Narrow
 * screens stack the plate under the copy — see `.home-art` in styles.css.
 *
 * Motion, all of it off under `prefers-reduced-motion`: a staggered entrance
 * (masthead, headline lines rising out of their own line boxes, lede, form),
 * the picture settling in, a breathing status bead, and hover detail on every control.
 */
export function HomePage() {
  return (
    <div className="home">
      <div className="home-stage">
        <div className="home-art" aria-hidden="true">
          <div className="home-plate">
            <img
              src="/harbour.webp"
              alt=""
              width={1672}
              height={941}
              decoding="async"
              fetchPriority="high"
              draggable="false"
            />
            <p className="home-caption">
              {home.caption.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </div>

        <header className="home-header home-drop" role="banner">
          <a href="/" className="home-brand" aria-label={brand.name}>
            <OrbitMark />
            <span aria-hidden="true">{brand.name}</span>
          </a>
          <nav className="home-nav" aria-label="Primary">
            <a href="#approach" className="home-nav-link">
              {home.nav.approach}
            </a>
            <a href={`mailto:${contactEmail}`} className="home-nav-link">
              {home.nav.contact}
            </a>
            <ButtonLink
              href="#early-access"
              arrow
              className="home-pill home-nav-cta"
              onClick={focusEmail}
            >
              {home.cta}
            </ButtonLink>
          </nav>
        </header>

        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-copy">
            <h1 id="home-title" className="home-title">
              <span className="home-line">
                <span>{home.headlineStart}</span>
              </span>{' '}
              <span className="home-line">
                <span>{home.headlineEnd}</span>
              </span>
            </h1>
            <p className="home-lede home-rise">
              {home.lede.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </p>
            <div id="early-access" className="home-form home-rise">
              <WaitlistForm inline />
            </div>
            <p className="home-status home-rise">
              <span className="home-bead" aria-hidden="true" />
              {home.status}
            </p>
          </div>
        </section>
      </div>

      <section id="approach" className="home-approach" aria-labelledby="approach-title">
        <Reveal>
          <p className="home-kicker">{home.approach.label}</p>
        </Reveal>
        <div className="home-approach-body">
          <Reveal>
            <h2 id="approach-title">{home.approach.headline}</h2>
          </Reveal>
          <Reveal delay={80}>
            <p>{home.approach.body}</p>
          </Reveal>
          <Reveal delay={160}>
            <p className="home-approach-qualifier">{home.approach.qualifier}</p>
          </Reveal>
        </div>
      </section>

      <footer className="home-footer" role="contentinfo">
        <p className="home-motto">{brand.motto}</p>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
      </footer>
    </div>
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

/**
 * `/logo.png`, redrawn as four ellipses on `currentColor`.
 *
 * The raster's hairline is drawn for 1254px and thins to nothing at header
 * size; this is the same geometry (read off the file: 86% by 41%, turned in
 * quarter-steps of 45°) with a stroke chosen for 40–60px, in the page's bronze.
 */
function OrbitMark() {
  return (
    <svg className="home-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {[0, 45, 90, 135].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="50"
          rx="43"
          ry="20.5"
          transform={`rotate(${angle} 50 50)`}
          stroke="currentColor"
          strokeWidth="2.4"
        />
      ))}
    </svg>
  )
}
