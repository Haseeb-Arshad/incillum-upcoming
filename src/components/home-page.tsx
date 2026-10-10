import { ButtonLink, Container, Label, TextLink } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { Thread } from '#/components/thread.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, home, nightfall, thread } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

import type { MatrixStatus } from '#/content/site.ts'
import type { MouseEvent } from 'react'

/**
 * The home page: night first, then morning.
 *
 * ── The acts ───────────────────────────────────────────────────────────────
 *
 * 1. **The plate.** The commissioned photograph, full-bleed, as the first
 *    screen: an empty office, one lamp, a quotation still lying under it. The
 *    headline sits over the dark side of the frame and the field sits under it.
 * 2. **The matrix.** The product's own object, lit like the paper under the
 *    lamp: one request's twenty lines with their status and their evidence, and
 *    the one call left for a person. Illustrative, and it says so first.
 * 3. **The thread.** How the night produced it, from 23:47 to 08:04.
 * 4. **The morning.** The page returns to the desk — the same desk the contact
 *    memo is laid on — with one invitation and the motto.
 *
 * Acts one to three are the page's single `[data-inverted]` region. Nothing
 * inside it knows it is dark; the matrix re-points the same tokens back to
 * paper with `[data-lit]`, the way the band re-points them to night.
 *
 * ── Why the photograph is mirrored ─────────────────────────────────────────
 *
 * In the original frame the lamp and the quotation are on the left, which is
 * where a headline has to go. Mirrored, they sit on the right and the dark
 * mass of the switched-off monitor sits under the words. Nothing in the frame
 * is legible, so nothing reads backwards.
 *
 * ── What it cannot borrow from the pages it is measured against ────────────
 *
 * Enterprise pages at this level lean on a wall of proof — customer logos,
 * volume figures, testimonials, certification badges. This site has none of
 * them and may not imply any (AGENTS.md §5). The matrix is the substitute, and
 * it is the honest one: it shows the work rather than claiming the result.
 *
 * Motion, all of it off under `prefers-reduced-motion`: the headline lines rise
 * out of their own boxes and the copy follows. The photograph does not move.
 */
export function HomePage() {
  return (
    <div className="home">
      <div data-inverted="" className="home-night">
        <section className="hero" aria-labelledby="home-title">
          <HeroPlate />

          <Container className="hero-inner">
            <header className="hero-header home-drop" role="banner">
              <SiteBrand />
              <nav className="desk-nav" aria-label="Primary">
                <a href={`#${home.night.anchor}`} className="desk-nav-link">
                  {home.nav.night}
                </a>
                <a href="/contact" className="desk-nav-link">
                  {home.nav.contact}
                </a>
                <ButtonLink href="#early-access" arrow className="desk-cta" onClick={focusEmail}>
                  {home.navCta}
                </ButtonLink>
              </nav>
            </header>

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
              </div>

              {/*
                The picture's title, set in the frame it names. Real text, so it
                is read aloud after the headline rather than lost in an `alt`.
              */}
              <p className="hero-caption home-rise">{nightfall.caption}</p>
            </div>
          </Container>
        </section>

        <section className="home-matrix" aria-labelledby="matrix-heading">
          <Container>
            <Reveal className="matrix-intro">
              <Label>{thread.label}</Label>
              <h2 id="matrix-heading" className="text-title text-ink">
                {home.matrix.heading}
              </h2>
              <p className="max-w-[52ch] text-lede text-ink-600">{home.matrix.lede}</p>
            </Reveal>
            <Reveal delay={80}>
              <Matrix />
            </Reveal>
          </Container>
        </section>

        <div id={home.night.anchor} className="home-thread">
          <Thread />
        </div>
      </div>

      <div className="desk">
        <section aria-labelledby="closing-title" className="home-closing">
          <Container>
            <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="flex flex-col gap-5 lg:col-span-7">
                <Label>{home.closing.label}</Label>
                <h2 id="closing-title" className="max-w-[18ch] text-title text-ink">
                  {home.closing.headline}
                </h2>
                <p className="max-w-[54ch] text-lede text-ink-600">{home.closing.body}</p>
              </div>

              <div className="flex flex-col items-start gap-8 lg:col-span-5 lg:pt-9">
                <ButtonLink href="/contact" arrow className="desk-cta desk-cta--large">
                  {home.closing.action}
                </ButtonLink>
                <div className="flex flex-col gap-2">
                  <Label>{home.closing.emailLabel}</Label>
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

        <footer className="home-footer" role="contentinfo">
          <Container>
            <Reveal className="flex flex-col gap-5 border-t border-line-strong pt-10 sm:pt-12">
              <SiteBrand />
              {/*
                The motto: one of its two placements on the whole site, and the
                last thing on the page. It is not extended and not repeated —
                see `brand.motto`.
              */}
              <p className="font-display text-title text-ink">{brand.motto}</p>
            </Reveal>
            <div className="mt-14 flex flex-col gap-3 border-t border-line-strong pt-7 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-small text-ink-600">
                © {new Date().getFullYear()} {brand.name}
              </p>
              <p className="text-small text-ink-600">{home.status}</p>
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
 * Same encodes as `Nightfall` (see the delivery note there), with `sizes` at
 * the full viewport because here the plate is. `fetchPriority="high"` and no
 * lazy loading: it is the largest thing in the first screen. The `alt` is the
 * composition, from `nightfall.alt`; the caption is a separate line of text.
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
 * The request, as the product would hand it back.
 *
 * A real `<table>`: twenty lines of a quotation are tabular data, and a screen
 * reader should be able to move across a row and down a column. Its caption is
 * the licence — illustrative, in the first line, at reading size.
 *
 * The figures in the summary are read off the thread's 06:50 ledger rather
 * than written here, and the counts are the content file's, which a test holds
 * to the rows. The signal colour appears twice, on the two things it is
 * licensed for: the held state, and the one figure that breaks the floor.
 */
function Matrix() {
  const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
  const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
  const shortfall = ledger.find((entry) => entry.breaches)
  const morning = thread.beats[thread.beats.length - 1]
  const { matrix } = home

  return (
    <div data-lit="" className="matrix">
      <div className="matrix-bar">
        <p className="matrix-title">
          <span className="matrix-mark" aria-hidden="true" />
          {matrix.title}
        </p>
        <p className="matrix-due">{matrix.due}</p>
      </div>

      <dl className="matrix-summary">
        <div>
          <dt>{matrix.summary.priced}</dt>
          <dd>
            {matrix.lines.priced}
            <span> / {matrix.lines.total}</span>
          </dd>
        </div>
        <div>
          <dt>{matrix.summary.held}</dt>
          <dd className="matrix-held">{matrix.lines.held}</dd>
        </div>
        <div>
          <dt>{matrix.summary.value}</dt>
          <dd>{figure('Quote value')}</dd>
        </div>
        <div>
          <dt>{matrix.summary.margin}</dt>
          <dd>
            {figure('Expected margin')}
            <span>
              {' '}
              · {matrix.summary.floor} {figure('Commercial floor')}
            </span>
          </dd>
        </div>
      </dl>

      {/*
        On a phone the table is wider than the screen and scrolls inside its
        own box. A scrolling region has to be reachable without a pointer, so it
        takes focus and carries a name.
      */}
      <div className="matrix-scroll" tabIndex={0} role="region" aria-label={matrix.title}>
        <table className="matrix-table">
          {/*
            The table's name for a screen reader. The same words are the
            visible first line of this section, directly above the panel, so
            printing them a second time here would only be repetition.
          */}
          <caption className="sr-only">{thread.label}</caption>
          <thead>
            <tr>
              <th scope="col">{matrix.columns.line}</th>
              <th scope="col">{matrix.columns.item}</th>
              <th scope="col">{matrix.columns.status}</th>
              <th scope="col">{matrix.columns.evidence}</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.line} data-status={row.status}>
                <td className="ic-tabular">{row.line}</td>
                <th scope="row">{row.item}</th>
                <td>
                  <Status status={row.status} />
                </td>
                <td>{row.evidence}</td>
              </tr>
            ))}
            <tr className="matrix-more">
              <td />
              <td colSpan={3}>
                <span className="ic-tabular">{matrix.more.count}</span> {matrix.more.text}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {shortfall ? (
        <div className="matrix-foot">
          <p className="matrix-shortfall">
            <span>{shortfall.term}</span>
            <strong>{shortfall.value}</strong>
          </p>
          {morning ? <p className="matrix-decision">{morning.title}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

function Status({ status }: { status: MatrixStatus }) {
  return <span className={`matrix-status matrix-status--${status}`}>{home.matrix.statusLabels[status]}</span>
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
