import { StateMark } from '#/components/charlie.tsx'
import { PageFrame } from '#/components/page-frame.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { Trust } from '#/components/trust.tsx'
import { security } from '#/content/site.ts'

/**
 * /security — in the shape the reference pages give theirs, and honest.
 *
 * The controls an enterprise team expects, each with its real state; then the
 * certifications a buyer looks for, each in its own card whose first line is
 * its status — not held — at reading size. A certification moves to held only
 * with its report, and this page links that report on the day it exists.
 *
 * The data commitments are the trust grid's, read from `trust`, so the front
 * page and this page cannot disagree about what is decided.
 */
export function SecurityPage() {
  const { hero, controls, frameworks, contact } = security
  return (
    <PageFrame>
      <section aria-labelledby="security-title" className="page-hero">
        <Container>
          <div className="page-hero-copy page-hero-copy--wide">
            <h1 id="security-title" className="page-title">
              {hero.headline}
            </h1>
            <p className="page-lede">{hero.lede}</p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="security-controls" className="security-section">
        <Container>
          <Reveal className="glass-act-title">
            <h2 id="security-controls" className="glass-heading">
              {controls.headline}
            </h2>
            <p className="glass-sources-lede">{controls.lede}</p>
          </Reveal>
          <Reveal delay={80}>
            <ul className="security-controls">
              {controls.items.map((control) => (
                <li key={control.title} className="security-control">
                  <StateMark state={control.state} />
                  <h3 className="security-control-title">{control.title}</h3>
                  <p className="security-control-body">{control.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section
        aria-labelledby="security-frameworks"
        className="security-section security-section--frameworks"
      >
        <Container>
          <Reveal className="glass-act-title">
            <h2 id="security-frameworks" className="glass-heading">
              {frameworks.headline}
            </h2>
            <p className="glass-sources-lede">{frameworks.lede}</p>
          </Reveal>
          <Reveal delay={80}>
            <ul className="security-frameworks">
              {frameworks.items.map((framework) => (
                <li key={framework.name} className="security-framework">
                  {/* The status first, at reading size: a card is never read as a badge. */}
                  <p className="security-framework-status">{framework.status}</p>
                  <h3 className="security-framework-name">{framework.name}</h3>
                  <p className="security-framework-covers">{framework.covers}</p>
                </li>
              ))}
            </ul>
            <p className="security-framework-note">{frameworks.note}</p>
          </Reveal>
        </Container>
      </section>

      {/* The data commitments, the front page's own grid, so the two cannot disagree. */}
      <Trust />

      <section aria-labelledby="security-contact" className="page-close">
        <Container>
          <Reveal className="glass-close-grid">
            <h2 id="security-contact" className="glass-close-title">
              {contact.headline}
            </h2>
            <div className="glass-close-side">
              <p className="glass-close-body">{contact.body}</p>
              <div className="glass-close-actions">
                <ButtonLink href="/contact" arrow className="desk-cta">
                  {contact.action}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageFrame>
  )
}
